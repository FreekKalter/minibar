package main

import (
	"bufio"
	"encoding/json"
	"flag"
	"fmt"
	"net/http"
	"os"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/gorilla/mux"
)

func main() {
	local := flag.Bool("local", false, "start on port 5000 for local 80 for public")
	flag.Parse()
	r := mux.NewRouter()
	r.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) { http.ServeFile(w, r, "index.html") })
	r.HandleFunc("/data", api)
	r.PathPrefix("/css/").Handler(http.StripPrefix("/css/", http.FileServer(http.Dir("css/"))))
	r.PathPrefix("/js/").Handler(http.StripPrefix("/js/", http.FileServer(http.Dir("js/"))))
	http.Handle("/", r)
	var err error
	if *local {
		err = http.ListenAndServe(":5000", r)
	} else {
		err = http.ListenAndServe(":80", r)
	}
	if err != nil {
		panic(err)
	}
}

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

const timeFormat = "Mon 02-01 15:04"

func api(w http.ResponseWriter, r *http.Request) {
	f, err := os.Open("../out.log")
	if err != nil {
		panic(err)
	}
	scanner := bufio.NewScanner(f)
	avgMap := make(map[string][]int64)
	for scanner.Scan() {
		tmp := strings.Split(scanner.Text(), "|")
		t, err := time.Parse(timeFormat, strings.TrimRight(tmp[0], " "))
		t1 := t.Round(time.Hour).Local()
		t2 := t1.Add(-time.Hour)
		if err != nil {
			panic(err)
		}
		i, err := strconv.ParseInt(strings.TrimLeft(tmp[1], " "), 10, 32)
		if err != nil {
			panic(err)
		}
		name := fmt.Sprintf("%d-%d", t2.Hour(), t1.Hour())
		avgMap[name] = append(avgMap[name], i)
	}
	list := make(TupleList, 0)
	for k, v := range avgMap {
		list = append(list, tuple{Name: k, Value: avg(v)})
	}
	sort.Sort(list)
	jsonEncoder := json.NewEncoder(w)
	jsonEncoder.Encode(list)
}

func avg(list []int64) int64 {
	var total int64
	for _, i := range list {
		total += i
	}
	return int64(total / int64(len(list)))
}
