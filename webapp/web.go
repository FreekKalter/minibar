package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net"
	"net/http"
	"net/http/fcgi"
	"os"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"text/template"
	"time"

	"github.com/gorilla/mux"
)

type tuple struct {
	Name  string
	Value int64
}

type TupleList []tuple

func (t TupleList) Swap(i, j int) { t[i], t[j] = t[j], t[i] }
func (t TupleList) Len() int      { return len(t) }
func (t TupleList) Less(i, j int) bool {
	a, _ := strconv.ParseInt(strings.Split(t[i].Name, "-")[0], 10, 32)
	b, _ := strconv.ParseInt(strings.Split(t[j].Name, "-")[0], 10, 32)
	return a < b
}

type Config struct {
	BrandList    map[string]string
	Port, Method string
	Logdir       string
	Env          string
}

var config Config

func main() {
	var err error
	configFile, err := ioutil.ReadFile("config.json")
	if err != nil {
		panic(err)
	}
	err = json.Unmarshal(configFile, &config)
	if err != nil {
		panic(err)
	}

	r := mux.NewRouter()
	r.HandleFunc("/", homeHandler)

	if config.Env == "testing" {
		r.HandleFunc("/favicon.ico", func(w http.ResponseWriter, r *http.Request) { http.ServeFile(w, r, "favicon.ico") })
		r.PathPrefix("/css/").Handler(http.StripPrefix("/css/", http.FileServer(http.Dir("css/"))))
		r.PathPrefix("/js/").Handler(http.StripPrefix("/js/", http.FileServer(http.Dir("js/"))))
	}

	r.HandleFunc("/{brand}/{method}", dataHandler)
	r.HandleFunc("/{brand}/{method}/{day:[0-9]}", dataHandler)
	http.Handle("/", r)
	listener, err := net.Listen("tcp", config.Port)
	if err != nil {
		panic(err)
	}
	if config.Method == "local" {
		fmt.Println("listening for http on port " + config.Port)
		err = http.Serve(listener, nil)
	} else if config.Method == "fcgi" {
		fmt.Println("listening for http on port " + config.Port)
		err = fcgi.Serve(listener, nil)
	} else if config.Method == "webserver" {
		err = http.ListenAndServe(":80", r)
	}
	if err != nil {
		panic(err)
	}
}
func homeHandler(w http.ResponseWriter, r *http.Request) {
	//fmt.Fprint(w, "<b>Hello</b>")
	t, err := template.ParseFiles("index.html")
	if err != nil {
		panic(err)
	}
	fmt.Println(config)
	err = t.Execute(w, config)
	if err != nil {
		panic(err)
	}
}

func dataHandler(w http.ResponseWriter, r *http.Request) {
	formVars := mux.Vars(r)
	var f *os.File
	var err error
	if filename, ok := config.BrandList[formVars["brand"]]; !ok {
		http.Error(w, "Onbekend merk", 404)
		return
	} else {
		f, err = os.Open(config.Logdir + "/" + filename)
		if err != nil {
			panic(err)
		}
	}
	if formVars["method"] == "heatmap" {
		//			  [uur] [ weekag ][ aantal_codes[] ]
		stage1 := make([]map[string][]int64, 24)
		for i := 0; i < 24; i++ {
			stage1[i] = make(map[string][]int64)
		}
		scanner := bufio.NewScanner(f)
		for scanner.Scan() {
			// parse time
			t, nr := parse_line(scanner.Text())
			stage1[t.Hour()][t.Weekday().String()] = append(stage1[t.Hour()][t.Weekday().String()], nr)
		}

		w.Write([]byte("day\thour\tvalue\n"))
		DayOrder := []int{1, 2, 3, 4, 5, 6, 0}
		for _, dag := range DayOrder {
			for uur := 0; uur < 24; uur++ {
				if dag == 0 {
					w.Write([]byte(fmt.Sprintf("%d\t%d\t%d\n", 7, uur+1, avg(stage1[uur][time.Weekday(dag).String()]))))
				} else {
					w.Write([]byte(fmt.Sprintf("%d\t%d\t%d\n", dag, uur+1, avg(stage1[uur][time.Weekday(dag).String()]))))
				}

			}

		}
	} else if formVars["method"] == "bars" {
		valid_integer_regex := regexp.MustCompile("^[0-9]{1,3}$")
		if !valid_integer_regex.MatchString(strings.TrimSpace(formVars["day"])) {
			return
		}
		DayOrder := []int{1, 2, 3, 4, 5, 6, 0}
		dayNr, _ := strconv.ParseInt(formVars["day"], 10, 32) //base 10, 32bit integer
		avgMap := make(map[string][]int64)
		scanner := bufio.NewScanner(f)
		for scanner.Scan() {
			// parse time
			t, nr := parse_line(scanner.Text())
			t2 := t.Add(-time.Hour)
			if t.Weekday() == time.Weekday(DayOrder[dayNr]) {
				name := fmt.Sprintf("%d-%d", t2.Hour(), t.Hour())
				avgMap[name] = append(avgMap[name], nr)
			}
		}
		list := make(TupleList, 0)
		for k, v := range avgMap {
			list = append(list, tuple{Name: k, Value: avg(v)})
		}
		sort.Sort(list)
		jsonEncoder := json.NewEncoder(w)
		jsonEncoder.Encode(list)

	} else {
		http.Error(w, "Dit adres is ongeldig", 404)
	}
}

func parse_line(line string) (t time.Time, nr int64) {
	tmp := strings.Split(line, "|")
	var err error
	timeFromFile, err := time.Parse(time.RFC1123, strings.TrimRight(tmp[0], " "))
	if err != nil {
		panic(err)
	}
	location, _ := time.LoadLocation("Europe/Amsterdam")
	t = timeFromFile.Round(time.Hour).In(location)
	nr, err = strconv.ParseInt(strings.TrimLeft(tmp[1], " "), 10, 32)
	if err != nil {
		panic(err)
	}
	return t, nr
}

func avg(stage2 []int64) int64 {
	var total int64
	for _, i := range stage2 {
		total += i
	}
	return int64(total / int64(len(stage2)))
}
