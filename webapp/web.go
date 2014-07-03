package main

import (
	"bufio"
	"encoding/json"
	"flag"
	"fmt"
	"net/http"
	"os"
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
	r.HandleFunc("/favicon.ico", func(w http.ResponseWriter, r *http.Request) { http.ServeFile(w, r, "favicon.ico") })
	r.HandleFunc("/grolsch/{format}", grolsch)
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

func grolsch(w http.ResponseWriter, r *http.Request) {

	formVars := mux.Vars(r)
	if formVars["format"] == "bars" {
		f, err := os.Open("../out.log")
		if err != nil {
			panic(err)
		}

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

		stage2 := make([]map[string]interface{}, 0)
		for uur, weekdagen := range stage1 {
			row := make(map[string]interface{})
			//row["Uur"] = int64(uur)
			if int(uur) == 0 {
				row["Uur"] = "23-0"
			} else {
				row["Uur"] = fmt.Sprintf("%d-%d", uur-1, uur)
			}

			for dag, nrs := range weekdagen {
				row[dag] = avg(nrs)
			}
			stage2 = append(stage2, row)
		}

		jsonEncoder := json.NewEncoder(w)
		jsonEncoder.Encode(stage2)

	} else {

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
