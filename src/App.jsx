import React,{useState,useEffect} from 'react';
import {Dropbox} from 'dropbox'
import util from './util'
import setMath from './setFunctions'
import './App.css';




function App() {
  const [dbx,setDbx] = useState(new Dropbox({ clientId: 'etx2qts20fi9qor' }))
  const [isAuth,setAuth]=useState(false);
  const [templateId,setTemplateId]=useState("");
  const [url,setUrl] = useState("");
  const [rootItems,setRootItems] = useState([]);
  const [files,setFiles] = useState({});
  const [tags,setTags] = useState({});
  const [currentFiles,setCurrentFiles] = useState([]);
  const [possibleTags,setPossibleTags] = useState([]);
  const [selectedTags,setSelectedTags] = useState([]);
  const [selectedFiles,setSelectedFiles] = useState([]);
  const [previewImg,setPreviewImage] = useState("https://icons.iconarchive.com/icons/iconsmind/outline/256/Files-icon.png");


  function selectFile(id){
    setSelectedFiles([id]);
    dbx.filesGetPreview({path:files[id].path_lower}).then((response)=>{
      setPreviewImage('data:image/bmp;base64,'+Base64.encode(response.result.fileBlob))
      console.log(response.result.fileBlob);
    });
  }

  function 


  function updateFilesAndTags({files,tags}){
    setFiles(files);
    setTags(tags);
    setPossibleTags(Object.entries(tags));
    setCurrentFiles(Object.keys(files));
    setSelectedTags([]);
    window.localStorage.setItem("files",JSON.stringify(files));
    let tagArr = Object.entries(tags).map(([tag,fileids])=>{
      return [tag,[...fileids]];
    });
    window.localStorage.setItem("tags",JSON.stringify(tagArr));
  }


  function applyFilter([tag,tagset]){
    let newPossibleTags=[];
    for(let i=0;i<possibleTags.length;i++){
      if(possibleTags[i][0]!==tag){
        let newTagSet =  setMath.intersection(possibleTags[i][1],tagset)
        if(newTagSet.size>0 ){
          newPossibleTags.push([possibleTags[i][0],newTagSet])
        }
      }
    }
    let newSelectedTags = [...selectedTags,tag]
    setSelectedTags(newSelectedTags)
    setPossibleTags(newPossibleTags);
    setCurrentFiles([...tagset])
  }

  function removeFilter(tag){
    let newTagSet;
    let newSelectedTags = [];
    let newPossibleTags = [];
    for(let i = 0;i<selectedTags.length;i++){
      if(selectedTags[i] !== tag){
        newTagSet = newTagSet?(
            setMath.intersection(tags[selectedTags[i]],newTagSet)
            ):(tags[selectedTags[i]])
        newSelectedTags.push(selectedTags[i])
      }
    }
    if(!newTagSet){
      setPossibleTags(Object.entries(tags));
      setCurrentFiles(Object.keys(files));
      setSelectedTags([]);
      return
    } else {

      for(let i=0;i<tags.length;i++){
        if(!newSelectedTags.includes(tags[i])){
          let newTagSet =  setMath.intersection(tags[i],newTagSet)
          if(newTagSet.size>0 ){
            newPossibleTags.push([possibleTags[i][0],newTagSet])
          }
        }
      }

    
    setSelectedTags(newSelectedTags);
    setPossibleTags(newPossibleTags);
    setCurrentFiles([...newTagSet]);
    return
    }
  }


  function getAccessTokenFromUrl() {
     return util.parseQueryString(window.location.hash).access_token;
    }

  useEffect(()=>{
    let token = getAccessTokenFromUrl()
    if (!getAccessTokenFromUrl() && url==="" && !isAuth ){
      let a = window.localStorage.getItem('logintoken')
      if(!!a){
        setDbx(new Dropbox({ accessToken: a }));
        setAuth(true);
      } else {
      var authUrl = dbx.auth.getAuthenticationUrl('https://setup.bengsquared.repl.co')
        .then((authUrl) => {
         window.location=authUrl
        })
      }
    } else if (!!getAccessTokenFromUrl() && !isAuth) {
      window.localStorage.setItem('logintoken',getAccessTokenFromUrl());
      setDbx(new Dropbox({ accessToken: getAccessTokenFromUrl() }));
      setAuth(true);
    } else if (isAuth){
      dbx.checkUser({query:"checkLogin"}).then((resp)=>{
          util.instantiateProps(dbx).then(function(response) {
            setTemplateId(response)
            return response
            }).then(
              (res)=>util.buildFileTree(dbx,res,updateFilesAndTags)
            );
        }, (error)=> { 
          window.localStorage.removeItem('logintoken');
          setAuth(false);
          setDbx(new Dropbox({ clientId: 'etx2qts20fi9qor' }));
        })
      
    }
  },[dbx])



  return (
    <main>
    {!isAuth?(
      <a href={url}>login to dropbox</a>
    ):(
      <div>
        <div> 
          <p>Selected Tags</p>
          {
            selectedTags.map((tag)=>{
          return(
            <div key={tag}>
            <button className="tag-button" 
            onClick={
              ()=>removeFilter(tag)
              }> {tag} </button>
            </div>
          );
        })}
        </div>
      <div className="container"> 
        <div className="tag-list">
          <p>tags</p>
          {possibleTags.map(([tag,set])=>{
            return(
              <div key={tag} className="tag-entry">
              <button className="tag-button" onClick={()=>applyFilter([tag,set])}>{tag} <span className="tag-count">{set.size}</span></button>
              </div>
            )
          })
          }
        </div>
        <div className="file-list-container">
          files
          <div className="file-list"> 
            <div  className="file-entry sticky">
              <div className="file-col">
              name
              </div>
              <div className="file-col">
              tags
              </div>
              <div className="file-col">
              last modified
              </div>
              <div className="file-col">
              size
              </div>
            </div>
            {currentFiles.map((id)=>{
              return(
                <div key={id} className="file-entry selectable" onClick={(e)=>
                  selectFile(id)
                }>
                    <div className="file-col">
                    {files[id].name}
                    </div>
                    <div className="file-col">
                      <div className="tag-container">
                      {files[id].tags.map((tag)=>
                        <span key={id+tag} className="file-tag">{tag}</span>
                      )}
                      </div>
                    </div>
                    <div className="file-col">
                    {new Date(files[id].client_modified).toDateString()}
                    </div>
                    <div className="file-col">
                    {
                      util.bytesToString(files[id].size)
                    }
                    </div>
                  </div>
              )
            })}
          </div>
        </div>
        {(selectedFiles.length >0)&&(
            <div className="file-inspector">
            <button onClick={(e)=>{setSelectedFiles([])}}>x</button>
                <div className="inspector-preview">
                  <img src={previewImg}></img>
                </div>
                <div className="inspector-file-info">
                  <h2 className="centered">
                    {files[selectedFiles[0]].name}
                  </h2>
                  <div className="tag-container">
                      {files[selectedFiles[0]].tags.map((tag)=>
                        <span key={tag} className="file-tag">{tag}</span>)}
                  </div>
                  <p>{"Last Modified: "+new Date(files[selectedFiles[0]].client_modified).toDateString()}</p>
                  <p>{"Size: "+ util.bytesToString(files[selectedFiles[0]].size)}</p>
                </div>
            </div>
          )}
      </div>
    </div>
    )}
  </main>
  );
}

export default App;