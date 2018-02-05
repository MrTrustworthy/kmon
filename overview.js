const API_ENDPOINT = "http://localhost:8083";
const CONNECTOR_ENDPOINT = API_ENDPOINT + "/connectors";

function fetchConnectorNames() {
  return fetch(CONNECTOR_ENDPOINT)
    .then(response => response.json())
    .then(json => {
      return json.sort()
    });
}

function fetchConnectorDataByName(endpoint, names) {
  let promises = names.map(connectorName => {
    return fetch(CONNECTOR_ENDPOINT + "/" + connectorName + endpoint)
      .then(response => response.json());
  });
  return Promise.all(promises);
}

let fetchConnectorDetails = fetchConnectorDataByName.bind(null, "");
let fetchConnectorTasks = fetchConnectorDataByName.bind(null, "/tasks");
let fetchConnectorStati = fetchConnectorDataByName.bind(null, "/status");

function consolidateData(names, details, tasks, stati) {
    let connectorData = {};
    names.forEach(name => {
        connectorData[name] = filterConnectorDataByName(name, details, tasks, stati);
    });
    return connectorData;
}

function filterConnectorDataByName(name, details, tasks, stati){
    return {
      detail: details.filter(d => d.name === name)[0],
      tasks: tasks.filter(t => t[0].id.connector === name),
      status: stati.filter(s => s.name === name)[0],
      endpoint: API_ENDPOINT
    };
}


const listApp = new Vue({
  el: '#list-connectors',
  data: {
    connectorData: {}
  },
  created() {
    let app = this;
    fetchConnectorNames().then(names => {
      Promise.all([
        fetchConnectorDetails(names),
        fetchConnectorTasks(names),
        fetchConnectorStati(names)
      ]).then(([details, tasks, stati]) => {
        app.connectorData = consolidateData(names, details, tasks, stati);
        console.log("Done with data", app.connectorData);
      });
    })
  }
})
