
const fileObjectFromResponse = (fileobject,propId)=>{
  let newFileObject=fileobject
  let t=[];
  for(let i=0;i<fileobject.property_groups.length;i++){
    console.log('comparison',fileobject.property_groups[i].template_id,propId);
    if(fileobject.property_groups[i].template_id===propId){
      t = fileobject.property_groups[i].fields[0].value.split('|').slice(1,-1)
      newFileObject.tags = t
      return {fileObject:newFileObject,tags:t,needsSetting:false}
    }
  }

  if(t.length===0){
    t=fileobject.path_lower.split("/").slice(1,-1)
    newFileObject.tags = t
    return {fileObject:newFileObject,tags:t,needsSetting:!(t.length===0)}
  }
  return {fileObject:newFileObject,tags:t,needsSetting:false}
}


const GetUserPropTemplates = async (dbx)=>{

    let response = await dbx.filePropertiesTemplatesListForUser()
    console.log(response)
    
    let template = false;

    if(response.status === 200){
      for(let i = 0; i < response.result.template_ids.length; i++){
        let templateDetails = await dbx.filePropertiesTemplatesGetForUser({
          "template_id":response.result.template_ids[i]
        });
        if(templateDetails.result.name === "FileNetworkInfo"){
          template = response.result.template_ids[i]
          window.localStorage.setItem("propertyTemplate",response.result.template_ids[i])
          break
        }
      }
    }

    if(!!template){
      return template
    } else {
      let newTemplateRequest = await dbx.filePropertiesTemplatesSetForUser({
      "name": "FileNetworkInfo",
      "description": "File Edge Metadata",
      "fields": [
        {
          "name": "TagLinks",
          "description": "pipe-separated list of tags a file has",
          "type":  "string"
        },
        {
          "name": "FileLinks",
          "description": "pipe-separated list of file IDs related to this file",
          "type": "string"
        }
      ]
      });
      if(newTemplateRequest.status === 200){
        console.log(newTemplateRequest.result)
        window.localStorage.setItem("propertyTemplate",newTemplateRequest.result.template_id);
        return newTemplateRequest.result.template_id
      }
      
    }
    return
};


var util = {

  bytesToString: (b) => {
    let labels = [' Bytes',' KB',' MB',' GB',' TB'];
    let i = 0;
    while(b>1000 && i<labels.length){
      b=Math.floor(b/1000)
      i++;
    }
    return (b+labels[i])
  },

  instantiateProps: async (dbx) => {
    let templateId = window.localStorage.getItem("propertyTemplate");
    if(!!templateId){
      return templateId
    }else{
      return await GetUserPropTemplates(dbx)
    }
  },

 buildFileTree: async (dbx,propId,callback) => {
   let files = JSON.parse(window.localStorage.getItem("files"))
   let tags = JSON.parse(window.localStorage.getItem("tags"))
   console.log(files);
   console.log(tags);
   if(!!files && !!tags){
     let savedTags = {};
     tags.forEach(([tag,fileIdArray])=>{
       savedTags[tag] = new Set(fileIdArray)

     });
     callback({files:files,tags:savedTags});
     return
   } else {
     files = {};
     tags = {};
   }
 
   let tagsToAdd=[];
   let fileRequest = await dbx.filesListFolder({
        "path": "",
        "recursive": true,
        "include_media_info": false,
        "include_deleted": false,
        "include_has_explicit_shared_members": false,
        "include_mounted_folders": true,
        "include_non_downloadable_files": true,
        "include_property_groups": {
          ".tag":"filter_some",
          "filter_some":[propId]
        }
      }
    );
    console.log(fileRequest);
  fileRequest.result.entries.forEach(entry=>{
  if(entry[".tag"] === "file"){
    let res = fileObjectFromResponse(entry,propId)
    files[res.fileObject.id]=res.fileObject
    res.tags.forEach(tag=>{
      if(tags[tag]){
        tags[tag].add(res.fileObject.id)
      }else{
        tags[tag]= new Set([res.fileObject.id])
      }
    });
    if(res.needsSetting){
      tagsToAdd.push({id:res.fileObject.id,tags:res.tags});
    }
  }});

  while(fileRequest.result.has_more){
    fileRequest = await dbx.filesListFolderContinue({
      "cursor":fileRequest.result.cursor
        }
    );
    console.log("fileRequest",fileRequest)
    fileRequest.result.entries.forEach(entry=>{
      console.log("inAddResult",entry);
    if(entry[".tag"] === "file"){
      let res = fileObjectFromResponse(entry,propId)
      files[res.fileObject.id]=res.fileObject
      console.log(res);
      res.tags.forEach(tag=>{
        if(tags[tag]){
          tags[tag].add(res.fileObject.id)
        }else{
          tags[tag]= new Set([res.fileObject.id])
        }
      });
      if(res.needsSetting){
        tagsToAdd.push({id:res.fileObject.id,tags:res.tags});
      }
    }});
  }
  console.log("files",Object.entries(files));
  console.log("tags",Object.entries(tags));
  callback({files:files,tags:tags});
  console.log(tagsToAdd);
  for(let i=0;i<tagsToAdd.length;i++){
    let r = await dbx.filePropertiesPropertiesOverwrite({
          path: `${tagsToAdd[i].id}`,
          property_groups: [
              {
                  template_id: propId,
                  fields: [
                      {
                          name: "TagLinks",
                          value: `|${tagsToAdd[i].tags.join('|')}|`
                      }
                  ]
              }
          ]
          });
    
  }
  return null;
 },

 parseQueryString: (str) => {
      const ret = Object.create(null);

      if (typeof str !== 'string') {
        return ret;
      }

      str = str.trim().replace(/^(\?|#|&)/, '');

      if (!str) {
        return ret;
      }

      str.split('&').forEach((param) => {
        const parts = param.replace(/\+/g, ' ').split('=');
        // Firefox (pre 40) decodes `%3D` to `=`
        // https://github.com/sindresorhus/query-string/pull/37
        let key = parts.shift();
        let val = parts.length > 0 ? parts.join('=') : undefined;

        key = decodeURIComponent(key);

        // missing `=` should be `null`:
        // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
        val = val === undefined ? null : decodeURIComponent(val);

        if (ret[key] === undefined) {
          ret[key] = val;
        } else if (Array.isArray(ret[key])) {
          ret[key].push(val);
        } else {
          ret[key] = [ret[key], val];
        }
      });

      return ret;
  }


};

export default util;