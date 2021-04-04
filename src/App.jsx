import React,{useState,useEffect} from 'react';
import './App.css';
import data from "./data"
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';

cytoscape.use( coseBilkent );


function App() {
  const [possibleTags,setPossibleTags]=useState(data.tags)
  const [selectedTags,setSelectedTags]=useState({})
  const [currentFiles,setCurrentFiles]=useState(data.files)
  const [currentFileOrder,setCurrentFileOrder]=useState(Object.keys(data.files));
  const [graphview,setGraphView] = useState(false);

  let one = currentFileOrder.map((key)=>{
    return {data: {id:key, label:currentFiles[key].name}}
  })

  let two = Object.keys(possibleTags).map((key)=>{
     return { 
      data: {
        id:key,
        label:possibleTags[key].name
      },
      style: {
        backgroundColor:possibleTags[key].color
      }
    }
  });

  let three = Object.keys(selectedTags).map((key)=>{
    return {
      data: {
        id:key,
        label:selectedTags[key].name
      },
      style:{
       backgroundColor:selectedTags[key].color
      }
    }
  });

  let four = currentFileOrder.map((key)=>{
    return currentFiles[key].tags.map((tag)=>{
      return {
        data: {
          id:tag+key,
          source:tag,
          target:key
        },
        style:{color:data.tags[tag].color}
      }
      })
  }).flat();

  const elements = [
    ...one,
    ...two,
    ...three,
    ...four
  ];
  
 const intersection=(arr)=>{
    if(arr.length===0){
      return [];
    }
    let result=[]
    let min=arr[0].length;
    let mindex=0;
    for(let i=0;i<arr.length;i++){
      if(arr[i].length<min){
        min=arr[i].length;
        mindex=i;
      }
    }

    result=arr[mindex]
    for(let i=0;i<arr.length;i++){
      if(i!==mindex){
        result=result.filter((f)=>arr[i].includes(f));
      }
    }
    return result
  }

  const sortByTag = (tag) =>{
    let newFileOrder = currentFileOrder
    newFileOrder.sort((a,b)=>{
      return currentFiles[b].tags.includes(tag)-currentFiles[a].tags.includes(tag)
    })
    setCurrentFileOrder([...newFileOrder]);
  }

  const filterFiles=()=>{
    if( Object.keys(selectedTags).length === 0 ){
      setCurrentFiles(data.files)
      setCurrentFileOrder(Object.keys(data.files))
      setPossibleTags(data.tags)
      return
    }

    let arrayOfFiles=Object.keys(selectedTags).map((tag)=>{return selectedTags[tag].files})
    let newFileIds = intersection(arrayOfFiles);
    let newFileObject = {};
    newFileIds.forEach( id => newFileObject[id]=data.files[id] );

    let arrayOfTags=Object.keys(newFileObject).map((file)=>{return newFileObject[file].tags})
    let newTagIds = [...new Set(arrayOfTags.flat(1))];
    let newTagObject = {};

    newTagIds.forEach((id)=>{
      if(!(Object.keys(selectedTags).includes(id))){
        newTagObject[id]=data.tags[id]
      }
    }
    );
    setPossibleTags(newTagObject);
    setCurrentFiles(newFileObject);
    setCurrentFileOrder(Object.keys(newFileObject))
  }


  useEffect(()=>{
    filterFiles();
  },[selectedTags])

  const selectTag = (tag) => {
    console.log(tag)
    let tempTagObj = selectedTags;
    tempTagObj[tag] = data.tags[tag];
    console.log(tempTagObj);
    setSelectedTags(tempTagObj);
    filterFiles();
  }
  
  const unselectTag = (tag) => {
    let tempTagObj = selectedTags;
    delete tempTagObj[tag]
    setSelectedTags(tempTagObj);
    filterFiles();
  }


  return (
    <main>
    <div className="heading"> <h2>tag-first file browser</h2>
    {"selected tags:"}
    <div>{Object.keys(selectedTags).map((tag)=>{
                return(<span key={"s"+tag} className="ellipsis" style={{backgroundColor:selectedTags[tag].color}}
                >
                  #{tag}
                  <button onClick={()=>unselectTag(tag)}>x</button>
                </span>)
              })}
          </div>
          </div>
    <div className="container">
      <div className="tag-list">
      <p>tags</p>
      {Object.keys(possibleTags).map(
        (tag)=>{
        return(
           <div key={tag} className="tag-entry">
            <button className="tag-button" style={{backgroundColor:possibleTags[tag].color}}
            onClick={()=>selectTag(tag)}
            >
            <span className="ellipsis">
            #{tag}
            </span>
            </button>
          </div>)}
      )}
      </div>
      <div className="file-list">
      <p>{"files  "}
      <button
      className={graphview&&"selected"}
       onClick={()=>setGraphView(true)}>graph</button>
      <button 
            className={!graphview&&"selected"}
            onClick={()=>setGraphView(false)}>list</button>
      </p> 
      {graphview ? (
       <CytoscapeComponent 
       layout={{name:"cose-bilkent"}}
       elements={elements} style={ { width: '100%', height: '600px' } } />
      ):(
        <div>
      <div className="file-entry">
      <div className="file-button">
            <b>{"name"}</b>
      </div>
      <div className="tag-graph">
      {Object.keys(data.tags).map((tag)=>{
          return(
                <div key={tag} className="pip"
                style={
                  {backgroundColor:data.tags[tag].color,
                  cursor:"pointer"
                  }
                  }
                onClick={()=>sortByTag(tag)}
                >
                </div>
          )
              })
              
            }
      </div>
      </div>
      {currentFileOrder.map(
        (file)=>{
        return(
           <div key={file} className="file-entry">
            <div className="file-button">
            {currentFiles[file].name}
            </div>

            <div className="tag-graph">
            {Object.keys(data.tags).map((tag)=>{
              return currentFiles[file].tags.includes(tag)?(
                <div key={tag} className="pip"
                style={
                  {backgroundColor:data.tags[tag].color}
                  }
                >
                </div>
              ):(
                <div key={tag} className="pip"
                style={
                  {backgroundColor:"white"}
                  }
                >
                </div>
              )
              })
              
            }
            </div>
          </div>)}
      )}
      </div>
      )
      }
      </div>
      </div>
    </main>
  );
}

export default App;