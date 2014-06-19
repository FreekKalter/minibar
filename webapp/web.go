package main

import (
	"bufio"
	"encoding/json"
	"net/http"
	"os"
	"regexp"
	"strconv"
	"strings"

	"github.com/gorilla/mux"
)

func main() {
	r := mux.NewRouter()
	r.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) { http.ServeFile(w, r, "index.html") })
	r.HandleFunc("/data", api)
	r.PathPrefix("/css/").Handler(http.StripPrefix("/css/", http.FileServer(http.Dir("css/"))))
	r.PathPrefix("/js/").Handler(http.StripPrefix("/js/", http.FileServer(http.Dir("js/"))))
	http.Handle("/", r)
	http.ListenAndServe(":5000", r)
}

type tuple struct {
	Name  string
	Value int64
}

func api(w http.ResponseWriter, r *http.Request) {
	f, err := os.Open("../out.log")
	if err != nil {
		panic(err)
	}
	scanner := bufio.NewScanner(f)
	list := make([]tuple, 0)
	timeRegex := regexp.MustCompile("[0-9]{2}:[0-9]{2}")
	for scanner.Scan() {
		tmp := strings.Split(scanner.Text(), "|")
		name := timeRegex.FindString(tmp[0])
		i, err := strconv.ParseInt(strings.TrimLeft(tmp[1], " "), 10, 32)
		if err != nil {
			panic(err)
		}
		list = append(list, tuple{Name: name, Value: i})
	}
	jsonEncoder := json.NewEncoder(w)
	jsonEncoder.Encode(list)
}
