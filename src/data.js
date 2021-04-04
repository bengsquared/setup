
var data = {
  "tags": {
    "process-pics": {
      "id":"process-pics",
      "name":"process-pics",
    "color":"lightgreen",
    "files": [1,2,6],
    },
    "work":{
      "id":"work",
      "name":"work",
    "color":"lightblue",
    "files":[1,2,3,4],
    },
    "desk":{
      "id":"desk",
      "name":"desk",
    "color":"lightpink",
    "files":[5,6,7],
    },
    "notes":{
      "id":"notes",
      "name":"notes",
    "color":"lightgoldenrodyellow",
    "files":[4,7],
    },
  }, 
  "files":{ 
    1:{
    "id":1,
    "name":"first prototype pic",
    "tags":["process-pics","work"]
    },
    2:{
    "id":2,
    "name":"final product",
    "tags":["process-pics","work"]
    },
    3:{
    "id":3,
    "name":"login info",
    "tags":["work"]
    },
    4:{
    "id":4,
    "name":"todo list",
    "tags":["work","notes"]
    },
    5:{
    "id":5,
    "name":"desk drawing",
    "tags":["desk"]
    },
    6:{
    "id":6,
    "name":"day 1 - desk picture",
    "tags":["process-pics","desk"]
    },
    7:{
    "id":7,
    "name":"plan for the new desk",
    "tags":["desk","notes"]
    },
  }
};

export default data ;
