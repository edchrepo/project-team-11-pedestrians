const stateBttns = document.querySelectorAll(".btn")
var colors = {"crime":"red","real_estate":"green","demographic":"blue"}
var state = {view:'crime',neighborhood:["Allston"], data: {"crime": null,"demographic": null,"real_estate":null, "survey":null }, set setN(x) {
  this.neighborhood = [...this.neighborhood, x];
  console.log(this.neighborhood)
  removeChart();
  render()
}, set removeN(x) {
  this.neighborhood = []
  removeChart()
  render()
}};

const removeChart = () => {
  d3.selectAll(".stuff").remove()
  d3.selectAll(".derp").remove()
  d3.selectAll(".x_axis").remove()
  d3.selectAll(".y_axis").remove()
}

var lineIndex = 0;
var db = []
//load all datasets here
var promises = [
        d3.csv("./data/csv_files/crime.csv",function(d){
                return {
                            time: parseInt(d.time),
                            value: +d.value,
                            neighborhood: d.neighborhood,
                            category: d.category
                          };
                        }),
        d3.csv("./data/csv_files/real_estate.csv",function(d){
          return {
                      time: d.time,
                      value: +d.value,
                      neighborhood: d.neighborhood,
                      category: d.category
                    };
                  }),
        d3.csv("./data/csv_files/demographic.csv",function(d){
          return {
                      time: d.time,
                      value: +d.value,
                      neighborhood: d.neighborhood,
                      category: d.category
                    };
                  }),
        d3.csv("./data/csv_files/ChesterSquareSurveyResponses.csv",function(d) {
                    return {
                      visittime: d.visittime,
                      safetylevel: + d.safetylevel
                    }}),
        d3.json("./data/json_files/boston.geojson")
    ]

const filterBar = (d) => {
  var result = {}
  var rArray = []
  var categorys = new Set(d.map(obj => obj.category));
  var neighborhoods = new Set(d.map(obj => obj.neighborhood))
  neighborhoods.forEach(n => {
    row = {}
    categorys.forEach(ot => {
      row[ot] = 0
    })
    result[n] = row
  })
  d.forEach(obj => {
    result[obj.neighborhood][obj.category] = result[obj.neighborhood][obj.category] + obj.value
  })
  Object.keys(result).forEach(neighborhood => {
    row = result[neighborhood]
    filtered_row = {}
    sortedKeys = Object.keys(result[neighborhood]).sort((a,b) => {
      return result[neighborhood][b] - result[neighborhood][a]}
      )
      var max = 0
      if(state.view !== "demographic") {
        max = 5
      } else {
        max = sortedKeys.length
      }
    for(let i = 0; i < max; i++) {
      filtered_row[sortedKeys[i]] = row[sortedKeys[i]]
    }
    filtered_row["neighborhood"] = neighborhood
    rArray.push(filtered_row)
  })
  return rArray
}

const filterLine = (d) => {
  if(state.view == "demographic") {
    return d.filter(obj => obj.category == "Bachelor's Degree or Higher")
  } else if (state.view === "real_estate") {
    return d.map((item) => {
            return {"time":new Date(Date.parse(item.time)).getFullYear(),"value": item.value / 1000}
          }).sort((a,b) => a.time - b.time);
 } else {
  return d.sort((a,b) => a.category - b.category)
 }
}

const render = () => {
        scatterplot(state.data["survey"]);
        lineChart(filterLine(state.data[state.view]));
        stackChart(filterBar(state.data[state.view]));
        geoViz({"data":state.data[state.view],"info":state.data["geo"]});
}

const setData = (d) => {
  state.data["crime"] = d[0];
  state.data["real_estate"] = d[1];
  state.data["demographic"] = d[2];
  state.data["survey"] = d[3];
  state.data["geo"] = d[4];
}

const load = () => {
    Promise.all(promises).then(setData).then(render);
};

stateBttns.forEach(btn => {
  btn.addEventListener("click" , (e) => {
    state["view"] = btn.attributes["data-activity"].nodeValue;
    removeChart()
    render()
  })
})

load();