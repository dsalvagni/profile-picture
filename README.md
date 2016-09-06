# Profile picture

[Demo version](http://www.dsalvagni.com.br/profile-picture) | [Codepen](http://codepen.io/dsalvagni/pen/BLapab)

## Todo
* Validate image size
* Center image while zooming

## Getting started
```
var pp = profilePicture(cssSelector, imageUrl?, options?);
```

## Options

### Slider options

#### initialValue
> Slider's handler initial position

#### minValue
> When the slider's handles is on its minimum position

#### maxValue
> When the slider's handles is on its maxixum position

### Image options

#### minWidth
> Set the minimum image's width size acceptable

#### minHeight
> Set the minimum image's height size acceptable

#### originalWidth
> Define the original image's width

#### originalHeight
> Define the original image's height

#### originalLeft
> Define the original image's left offset

#### originalTop
> Define the original image's top offset

## Callbacks

### onLoad
> When the image is loaded, this event is fired with the **model** as parameter.

### onChange
> When anything changed, this event is fired with the **model** as parameter.

### onRemove
> When the image is remove, this event is fired with an empty **model** as parameter.

### onSliderChange
> When you drag the slider handler/zooming, this event is fired with the **model** as parameter.

### onPositionChange
> When you drag the image, this event is fired with the **model** as parameter.

## Methods

### getData
```
    /* Returns the model */
    pp.getData();
```
