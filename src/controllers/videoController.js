import User from "../models/User";
import Video from "../models/Video";

export const home = async(req, res) => {
    const videos = await Video.find({}).sort({createdAt: "desc"});
    return res.render("home", {pageTitle: "Home", videos });
};

export const watch = async(req,res) => {
    const { id } = req.params;
    const video = await (await Video.findById(id)).populate("owner");
    if (!video){
        return res.render("404", {pageTitle: "Video not found"});
    }
    return res.render("videos/watch", {pageTitle: video.title, video});
};

export const getEdit = async(req,res) => {
    const { id } = req.params;
    const {user: { _id }} = req.session;
    const video = await Video.findById(id);
    if (!video){
        return res.status(404).render("404", {pageTitle: "Video not found"});
    }
    if(String(video.owner) !== String(_id)){
        return res.status(403).redirect("/")
    }
    return res.render("/videos/edit", {pageTitle: `Edit: ${video.title}`, video});
};

export const postEdit = async(req,res) => {
    const {user: { _id }} = req.session;
    const { id } = req.params;
    const { title,description,hashtags  } = req.body;
    const video = await Video.exists({_id: id});
    if (!video){
        return res.status(404).render("404", {pageTitle: "Video not found"});
    }
    if(String(video.owner) !== String(_id)){
        return res.status(403).redirect("/")
    }
    await Video.findByIdAndUpdate(id, {
        title,
        description,
        hashtags: Video.formatHashtags(hashtags)
    });
    return res.redirect(`/videos/${id}`);
};

export const getUpload = (req,res) => {
    return res.render("videos/upload", {pageTitle: "Upload Video"});
};

export const postUpload = async(req,res) => {
    const { user: { _id } } = req.session;
    const {path: fileUrl} = req.file;
    const { title,description,hashtags  } = req.body;
    try {
        const newVideo = await Video.create({
            title,
            description,
            fileUrl,
            hashtags: Video.formatHashtags(hashtags),
            owner: _id
        });
        const user = await User.findById(_id);
        user.videos.push(newVideo._id);
        user.save();
        return res.redirect("/");
    } catch (error) {
        return res.status(400).render("videos/upload", {
            pageTitle: "Upload Video", 
            errorMessage: error._message
        });
    }
};

export const deleteVideo = async (req,res) => {
    const { id } = req.params;
    const {user: { _id }} = req.session;
    const video = await Video.findById(id);
    if(!video){
        return res.status(404).render("404", {pageTitle: "Video not found"});
    }
    if (String(video.owner) !== String(_id)){
        return res.status(403).redirect("/")
    }
    await Video.findOneAndDelete(id);
    return res.redirect("/");
}

export const search = async (req,res) => {
    const { search_query } = req.query;
    let videos = [];
    if(search_query){
        videos = await Video.find({
            title: {
                $regex: new RegExp(search_query, "i")
                }
        });
    }
    return res.render("videos/search", {pageTitle: "Search", videos});
};