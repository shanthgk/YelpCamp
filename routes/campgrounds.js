const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
const getCreatedTime = require('../utils/getCreatedTime');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const {campgroundSchema} = require('../schemas.js');

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }else{
        next();
    }  
}

router.get('/', catchAsync(async(req, res) => {
    const campgrounds = await Campground.find();
    res.render('campgrounds/index', {campgrounds});
}));

router.get('/new', (req, res) => {
    res.render('campgrounds/new');
});

router.post('/', validateCampground, catchAsync(async(req, res) => {  
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'Successfully created a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.get('/:id', catchAsync(async(req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    if(!campground){
       req.flash('error', 'Cannot find that campground!');
       res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', {campground, getCreatedTime});
}));

router.get('/:id/edit', catchAsync(async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    if(!campground){
        req.flash('error', 'Cannot find that campground!');
        res.redirect('/campgrounds');
     }
    res.render('campgrounds/edit', {campground});
}));

router.put('/:id', validateCampground, catchAsync(async(req, res) => {
    const { id }  = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground}, {new: true});
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete('/:id', catchAsync(async(req, res) => {
    const { id }  = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted a campground!');
    res.redirect('/campgrounds');
}));

module.exports = router;