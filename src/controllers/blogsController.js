const BlogsModel=require("../models/blogsModel")
const AuthorModel=require("../models/authorModel")

const createBlogs= async function(req,res)
{
    try
    {
        let data=req.body;
        let author=data.authorId;
        let validAuthor= await AuthorModel.find({_id:author})
        if(Object.keys(validAuthor).length===0)
            {
                return res.status(400).send({status:false, msg:"Enter a valid author"})
            }
    let blogCreated = await BlogsModel.create(data);
    if(blogCreated.isPublished==true){
      let blogUpdated = await BlogsModel.findOneAndUpdate({_id:blogCreated._id},{publishedAt: Date.now()},{new:true})
      return res.status(201).send({status: true, data:blogUpdated})
     }
     return res.status(201).send({ status: true, data: blogCreated });
    //  let savedData= await BlogsModel.create(data);
    //  return res.status(201).send({status:true, data:savedData})
    }
    catch(error)
    {
        return res.status(500).send({msg: "Error", error:error.message})
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////
const getBlogs= async function(req, res)
{
    try{
        let filter = req.query;
        if(Object.keys(filter).length===0){
            let blogs = await BlogsModel.find({$and:[{isDeleted:false},{isPublished: true}]}).populate("authorId")
            if(blogs.length===0){
                return res.status(404).send({status:false, msg:"Blogs not found."})
            }
            let x=blogs.length;
            return res.status(200).send({status: true, total:x,data: blogs})
            
        }
        if(filter.tags==undefined && filter.subcategory==undefined){
            let blogs = await BlogsModel.find({$and:[filter,{isDeleted:false},{isPublished: true}]}).populate("authorId")
            if(!blogs){
                return res.status(404).send({status:false, msg:"Blogs not found."})
            }
            return res.status(200).send({status: true, data: blogs})
        }
        if(filter.tags!=undefined && filter.subcategory==undefined){
            let tags = filter.tags
            delete filter.tags;
            let blogs = await BlogsModel.find({$and:[{tags:{$in:[tags]}},filter,{isDeleted:false},{isPublished: true}]}).populate("authorId")
            if(blogs.length===0){
                return res.status(404).send({status:false, msg:"Blogs not found."})
            }
            return res.status(200).send({status:true, data: blogs})
        }
        if(filter.tags==undefined && filter.subcategory!=undefined){
            let subCat = filter.subcategory
            delete filter.subcategory;
            let blogs = await BlogsModel.find({$and:[{subcategory:{$in:[subCat]}},filter,{isDeleted:false},{isPublished: true}]}).populate("authorId")
            if(blogs.length===0){
                return res.status(404).send({status:false, msg:"Blogs not found."})
            }
            return res.status(200).send({status: true, data: blogs})
        }
        if(filter.tags!=undefined && filter.subcategory!=undefined){
            let subCat = filter.subcategory
            let tags = filter.tags
            delete filter.subcategory;
            delete filter.tags
            let blogs = await BlogsModel.find({$and:[{subcategory:{$in:[subCat]}},{tags:{$in:[tags]}},filter,{isDeleted:false},{isPublished: true}]}).populate("authorId")
            if(blogs.length===0){
                return res.status(404).send({status:false, msg:"Blogs not found."})
            }
            return res.status(200).send({status: true, data: blogs})
        }
    }catch(error){
            return res.status(500).send({msg: "Error", error:error.message})
        }
    }
//////////////////////////////////////////////////////////////////////////////////////////////
const updateBlogs = async function (req, res) {
    try {
      let updateblog = req.params.blogId
      let update = await blogsModel.findById(updateblog)
      if (!updateblog) {
        return res.status(404).send({ msg: "Invalid Blog" })
      }
      let updatedata = req.body;
      let updatedUser = await blogsModel.findOneAndUpdate({ _id: updateblog }, { title: updatedata.title, body: updatedata.body, tags: updatedata.tags, subcategory: updatedata.subcategory, isPublished:updatedata.isPublished,isDeleted:updatedata.isDeleted }, { new: true, upsert: true });
      res.status(200).send({ status: true, data: updatedUser })
  
    } catch (err) {
      res.status(500).send({ Error: err.message })
    }
  }
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

const deleteBlogById= async function(req,res)
{
    try{
    let blog=req.params.blogId;
   
    let validBlog=await BlogsModel.findOneAndUpdate(
        {_id:blog, isDeleted:false},
        {$set:{isDeleted:true,deletedAt:Date.now()}},
        {new:true}
    )
    if(!validBlog)
    {
        return res.status(404).send({status:false, msg:"No such blog exists"})
    }
    return res.status(200).send({status:true, msg:"Blog deleted"})
    }
    catch(error){
        return res.status(500).send({msg: "Error", error:error.message})
    }
    
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const deleteBlogByQueryParams= async function(req,res)
{
        
    try{
        let filter=req.query;
        //let queryParams = req.query
        let decodeId = req.authorId;
        if (filter.authorId != decodeId) {
            res.status(401).send({ status: false, message: `Unauthorized access! Owner info doesn't match` });
            return
        }

        if(Object.keys(filter).length===0){
            return res.status(400).send({status: false, msg:"Please enter a valid category."})
        }
        if(filter.tags==undefined && filter.subcategory==undefined){
            let data= await BlogsModel.updateMany({$and:[filter, {isDeleted: false}]},
                    {$set:{isDeleted:true,deletedAt:Date.now()}},
                    {new:true})
                    

                if(data.length>0){
                    return res.status(200).send({status:true, msg:"Blogs Deleteds"})
                       
                }
                else{
                    return res.status(404).send({status:false,msg:"No data found"}) 
                }
            
        }
        if(filter.tags!=undefined && filter.subcategory==undefined){
            let tags = filter.tags
            delete filter.tags;
            let blogs = await BlogsModel.updateMany({$and:[{tags:{$in:[tags]}},filter,{isDeleted: false}]},
                {$set:{isDeleted:true,deletedAt:Date.now()}},
                {new:true})
            if(blogs.length!==0){
                return res.status(200).send({ status:true,msg: "Blogs deleted"})
            }
            return res.status(404).send({status:false,msg:"No data found"})
        }
        if(filter.tags==undefined && filter.subcategory!=undefined){
            let subCat = filter.subcategory
            delete filter.subcategory;
            let blogs = await BlogsModel.updateMany({$and:[{subcategory:{$in:[subCat]}},filter,{isDeleted: false}]},
                {$set:{isDeleted:true,deletedAt:Date.now()}},
                {new:true})
            if(blogs.length!==0){
                return res.status(200).send({ status:true,msg: "Blogs deleted"})
            }
            return res.status(404).send({status:false,msg:"No data found"})
            
        }
        if(filter.tags!=undefined && filter.subcategory!=undefined){
            let subCat = filter.subcategory
            let tags = filter.tags
            delete filter.subcategory;
            delete filter.tags
            let blogs = await BlogsModel.updateMany({$and:[{tags:{$in:[tags]}},{subcategory:{$in:[subCat]}},filter,{isDeleted: false}]},
                {$set:{isDeleted:true,deletedAt:Date.now()}},
                {new:true})
            if(blogs.length!==0){
                return res.status(200).send({ status:true,msg: "Blogs deleted"})
            }
            return res.status(404).send({status:false,msg:"No data found"})
            
        }
    }   
catch(error){
    return res.status(500).send({msg: "Error", error:error.message})
}
}
module.exports.createBlogs=createBlogs;
module.exports.getBlogs=getBlogs;
module.exports.updateBlogs=updateBlogs;
module.exports.deleteBlogById=deleteBlogById;
module.exports.deleteBlogByQueryParams=deleteBlogByQueryParams;
