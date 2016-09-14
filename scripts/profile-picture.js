/**
 * Profile picture
 * @author Daniel Salvagni <danielsalvagni@gmail.com>
 */


/**
 * Turn the globals into local variables.
 */
; (function (window, $, undefined) {
    if (!window.profilePicture) {
        window.profilePicture = profilePicture;
    }

    /**
     * Component
     */
    function profilePicture(cssSelector, imageFilePath, options) {
        var self = this;
        /**
         * Map the DOM elements
         */
        self.element = $(cssSelector);
        self.photoImg = $(cssSelector + ' .photo__circle img');
        self.photoLoading = $(cssSelector + ' .photo__circle .message.is-loading');
        self.photoOptions = $(cssSelector + ' .photo__options');
        self.photoFrame = $(cssSelector + ' .photo__circle');
        self.photoArea = $(cssSelector + ' .photo');
        /**
         * Image info to post to the API
         */
        self.model = {
            imageSrc: null,
            width: null,
            height: null,
            originalWidth: null,
            originalHeight: null,
            top: null,
            left: null,
            scale: null,
            cropWidth: null,
            cropHeight: null
        };


        /**
         * Plugin options
         */
        self.options = {};
        /**
         * Plugins defaults
         */
        self.defaults = {};
        /**
         * Callbacks
         */
        self.defaults.onChange = null;
        self.defaults.onSliderChange = null;
        self.defaults.onImageSizeChange = null;
        self.defaults.onPositionChange = null;
        self.defaults.onLoad = null;
        self.defaults.onRemove = null;
        self.defaults.onError = null;
        /**
         * Slider default options
         */
        self.defaults.slider = {
            initialValue: 100,
            minValue: 1,
            maxValue: 200
        };
        /**
         * Image default options
         */
        self.defaults.image = {
            originalWidth: 0,
            originalHeight: 0,
            originalTop: 0,
            originalLeft: 0,
            minWidth: 350,
            minHeight: 350
        };

        /**
         * Slider controls
         */
        self.slider = $(cssSelector + ' .slider');
        self.sliderArea = $(cssSelector + ' .slider__area');
        self.sliderHandler = $(cssSelector + ' .slider__handler');

        /**
         * Call the constructor
         */
        init(cssSelector, imageFilePath, options);

        /**
         * Return public methods
         */
        return {
            getData: getData,
            scaleImage: function(scale) {
                scaleImage(scale/2);
            },
            removeImage: removeImage
        };



        /**
         * Constructor
         * Register all components and options.
         * Can load a preset image
         */
        function init(cssSelector, imageFilePath, options) {
            if (imageFilePath) {
                loadImage(imageFilePath);
            } else {
                self.photoArea.addClass('photo--empty');
            }

            self.options = $.extend({}, self.defaults, options);

            registerDropZoneEvents();
            registerImageDragEvents();
            registerSliderControlEvents();
        }

        /**
         * Return the model
         */
        function getData() {
            return model;
        }
        /**
         * Set the model
         */
        function setModel(model) {
            self.model = model;
        }

        /**
         * Load the image info an set image source
         */
        function loadImage(imageUrl) {

            self.model.imageSrc = imageUrl;
            self.photoArea.addClass('photo--loading');
            self.photoImg.attr('src', imageUrl)
                .on('load', function () {
                    if (this.width < self.options.image.minWidth ||
                        this.height < self.options.image.minHeight) {
                        self.photoArea.addClass('photo--error--image-size photo--empty');
                        setModel({});

                        /**
                       * Call the onError callback
                       */
                        if (typeof self.options.onError === 'function') {
                            self.options.onError('image-size');
                        }
                        return;
                    } else {
                        self.photoArea.removeClass('photo--error--image-size');
                    }
                    self.photoArea.removeClass('photo--empty photo--error--file-type photo--loading');
                    self.model.originalHeight = this.height;
                    self.model.originalWidth = this.width;
                    self.model.height = this.height;
                    self.model.width = this.width;
                    self.model.scale = self.options.slider.initialValue;
                    self.model.cropWidth = self.photoFrame.outerWidth();
                    self.model.cropHeight = self.photoFrame.outerHeight();
                    resetSlider();
                    $(this).removeClass('hide');
                    self.photoOptions.removeClass('hide');
                    /**
                     * Call the onLoad callback
                     */
                    if (typeof self.options.onLoad === 'function') {
                        self.options.onLoad(self.model);
                    }
                });
        }
        /**
         * Reset the slider handler to the default position
         */
        function resetSlider() {
            /**
             * Reset the slider scale values
             */
            self.options.slider.initialValue = self.model.width;
            self.options.slider.minValue = self.photoFrame.outerWidth();
            self.options.slider.maxValue = self.model.originalWidth * 2;

            self.slider.removeClass('slider--maxValue')
                .removeClass('slider--minValue');
            self.sliderHandler.css({
                left: getPercentageOf(self.options.slider.initialValue, self.options.slider.maxValue) + '%'
            });
        }

        /**
         * Helper to calculate the new image's size
         */
        function calcNewImageSize(percentage) {
            var ratio = getPercentageOf(self.options.slider.minValue, self.options.slider.maxValue) * 2;
            percentage = percentage + ratio;
            /**
             * Element
             */
            var newWidth = ((percentage * self.model.originalWidth) / 100);
            var width = self.photoImg.width();
            var newHeight = ((percentage * self.model.originalHeight) / 100);
            var height = self.photoImg.height();
            var top = self.photoImg.position().top;
            var left = self.photoImg.position().left;
            /**
             * Container
             */
            var parent = self.photoImg.parent();
            var parentLeft = parent.offset().left;
            var parentTop = parent.offset().top;
            var parentWidth = parent.outerWidth();
            var parentHeight = parent.outerHeight();
            /**
             * Calculates the image position to keep it centered
             */
            var deltaTop = (self.photoImg.position().top - (parentWidth / 2)) / height;
            var deltaLeft = (self.photoImg.position().left - (parentWidth / 2)) / width;
            var top = deltaTop * newHeight + (parentWidth / 2);
            var left = deltaLeft * newWidth + (parentWidth / 2);


            /**
             * Limit the area to drag horizontally
             */
            if (left >= 0) {
                left = 0;
            } else if (newWidth + (left - parentLeft) < parentWidth) {
                /**
                 * Calculates to handle the empty space on the right side
                 */
                left = Math.abs((newWidth - parent.outerWidth())) * -1;
            }
            /**
             * Limit the area to drag vertically
             */
            if (top >= 0) {
                top = 0;
            } else if (newHeight + (top - parentTop) < parentHeight) {
                /**
                 * Calculates to handle the empty space on bottom
                 */
                top = Math.abs((newHeight - parentHeight)) * -1;
            }
            /**
             * Set the model
             */
            self.model.height = newHeight;
            self.model.width = newWidth;
            self.model.top = top;
            self.model.left = left;
            self.model.scale = percentage - ratio;

            return self.model;
        }

        /**
         * Helper to resize the image
         */
        function resizeImage() {
            if (self.options.image.scale < 0) return;

            var newSize = calcNewImageSize(self.options.image.scale);

            /**
             * Limit the image size to the container size.
             */
            if (newSize.width < self.photoFrame.outerWidth()) {
                return;
            }
            if (newSize.height < self.photoFrame.outerHeight()) {
                return;
            }
            self.photoImg.css({
                width: newSize.width,
                top: newSize.top,
                left: newSize.left
            });
            /**
             * Call the onChange callback
             */
            if (typeof self.options.onChange === 'function') {
                self.options.onChange(self.model);
            }
            /**
             * Call the onImageSizeChange callback
             */
            if (typeof self.options.onImageSizeChange === 'function') {
                self.options.onImageSizeChange(self.model);
            }
        }

        /**
         * Convert scale value to percentage
         */
        function getPercentageOf(val, max) {
            return parseInt(((val * 100) / max).toFixed(0));
        }
        /**
         * Change the image size by a percentage.
         * Updates the slider values as well.
         */
        function scaleImage(percentage) {
            /**
             * Set a css class to the slider if it gets to its minimum value
             */
            if (percentage <= 0) {
                self.slider.addClass('slider--minValue');
                percentage = 0;
            } else {
                self.slider.removeClass('slider--minValue');
            }
            /**
             * Set a css class to the slider if it gets to its maximum value
             */
            if (percentage >= 100) {
                self.slider.addClass('slider--maxValue');
                percentage = 100;
            } else {
                self.slider.removeClass('slider--maxValue');
            }

            self.sliderHandler.css({
                left: percentage + '%'
            });

            self.options.image.scale = percentage * 2;

            resizeImage();
        }
        /**
         * Remove the image and reset the component state
         */
        function removeImage() {
            self.photoImg.addClass('hide').attr('src', '')
                .attr('style', '');
            self.photoArea.addClass('photo--empty');
            setModel({});

            /**
             * Call the onRemove callback
             */
            if (typeof self.options.onRemove === 'function') {
                self.options.onRemove(self.model);
            }
        }

        /**
         * Register the file drop zone events 
         */
        function registerDropZoneEvents() {
            var target = null;
            /**
             * Stop event propagation to all dropzone related events.
             */
            self.element.on('drag dragstart dragend dragover dragenter dragleave drop', function (e) {
                e.preventDefault();
                e.stopPropagation();
                e.originalEvent.dataTransfer.dropEffect = 'copy';
            });

            /**
             * Register the events when the file is out or dropped on the dropzone
             */
            self.element.on('dragend dragleave drop', function (e) {
                if (target === e.target) {
                    self.element.removeClass('is-dragover');
                }
            });
            /**
             * Register the events when the file is over the dropzone
             */
            self.element.on('dragover dragenter', function (e) {
                target = e.target;
                self.element.addClass('is-dragover');
            });
            /**
             * On a file is selected, calls the readFile method.
             * It is allowed to select just one file - we're forcing it here.
             */
            self.element.on('change', 'input[type=file]', function (e) {
                if (this.files && this.files.length) {
                    readFile(this.files[0]);
                    this.value = '';
                }
            });
            /**
             * Handle the click to the hidden input file so we can browser files.
             */
            self.element.on('click', '.photo--empty .photo__circle', function (e) {
                $(cssSelector + ' input[type=file]').trigger('click');

            });
            /**
             * Register the remove action to the remove button.
             */
            self.element.on('click', '.remove', function (e) {
                removeImage();
            });
            /**
             * Register the drop element to the container component
             */
            self.element.on('drop', function (e) {
                readFile(e.originalEvent.dataTransfer.files[0]);
            });


            /**
             * Only into the DropZone scope.
             * Read a file using the FileReader API.
             * Validates file type.
             */
            function readFile(file) {
                self.photoArea.removeClass('photo--error photo--error--file-type photo--error-image-size');
                /**
                 * Validate file type
                 */
                if (!file.type.match('image.*')) {
                    self.photoArea.addClass('photo--error--file-type');
                    /**
                     * Call the onError callback
                     */
                    if (typeof self.options.onError === 'function') {
                        self.options.onError('file-type');
                    }
                    return;
                }

                var reader;
                reader = new FileReader();
                reader.onloadstart = function () {
                    self.photoArea.addClass('photo--loading');
                }
                reader.onloadend = function (data) {
                    self.photoImg.css({ left: 0, top: 0 });
                    loadImage(data.target.result);
                }
                reader.onerror = function () {
                    self.photoArea.addClass('photo--error');
                    /**
                     * Call the onError callback
                     */
                    if (typeof self.options.onError === 'function') {
                        self.options.onError('unknown');
                    }
                }
                reader.readAsDataURL(file);
            }
        }
        /**
         * Register the image drag events
         */
        function registerImageDragEvents() {
            var $target, x, y;
            /**
             * Get the image info
             */
            self.photoImg.on("mousedown touchstart", function (e) {
                $target = $(e.target);
                var pageX = e.pageX || e.touches[0].pageX;
                var pageY = e.pageY || e.touches[0].pageY;
                /**
                 * Firefox
                 */
                if (e.offsetX == undefined) {
                    x = pageX - $(this).offset().left;
                    y = pageY - $(this).offset().top;
                } else {
                    x = e.offsetX;
                    y = e.offsetY;
                };

            });
            /**
             * Stop dragging
             */
            $(document).on("mouseup touchend", function (e) {
                if ($target) {
                    /**
                 * Call the onPositionChange callback
                 */
                    if (typeof self.options.onPositionChange === 'function') {
                        self.options.onPositionChange(self.model);
                    }
                    /**
                     * Call the onChange callback
                     */
                    if (typeof self.options.onChange === 'function') {
                        self.options.onChange(self.model);
                    }
                }
                $target = null;
            });
            /**
             * Drag the image inside the container
             */
            $(document).on("mousemove touchmove", function (e) {

                if ($target) {
                    var pageX = e.pageX || e.touches[0].pageX;
                    var pageY = e.pageY || e.touches[0].pageY;

                    var top = (pageY) - y;
                    var left = (pageX) - x;
                    var parent = $target.parent();
                    var parentLeft = parent.offset().left;
                    var parentTop = parent.offset().top;
                    var parentWidth = parent.outerWidth();
                    var parentHeight = parent.outerHeight();
                    /**
                     * Limit the area to drag horizontally
                     */
                    if (left >= parentLeft) {
                        left = parentLeft;
                    } else if ($target.width() + (left - parentLeft) < parentWidth) {
                        return;
                    }
                    /**
                     * Limit the area to drag vertically
                     */
                    if (top >= parentTop) {
                        top = parentTop
                    } else if ($target.height() + (top - parentTop) < parentHeight) {
                        return;
                    }

                    self.model.top = top;
                    self.model.left = left;

                    $target.offset({
                        top: top,
                        left: left
                    });
                };
            });
        }
        /**
         * Register the slider control events
         */
        function registerSliderControlEvents() {
            /**
             * Init
             */
            var startOffset,
                holderOffset,
                sliderWidth,
                handleWidth;
            /**
             * Initialize with the initial value
             */
            self.sliderHandler.css({
                left: getPercentageOf(self.options.slider.initialValue, self.options.slider.maxValue) + '%'
            });

            /**
             * Register the mouse and keyboard events
             */
            self.sliderHandler.on('keydown', keyboardNavigation);
            /**
             * The focus event allow us to change the slider position with the keyboard.
             */
            self.sliderHandler.on('mousedown focus touchstart', function (e) {
                holderOffset = self.sliderArea.offset().left;
                startOffset = self.sliderHandler.offset().left - holderOffset;
                sliderWidth = self.sliderArea.width();

                $(document).on('mousemove touchmove', moveHandler);
                $(document).on('mouseup blur touchend', stopHandler);
            });

            /**
             * Allow the user to click on the slider to scale
             */
            self.sliderArea.on('click', function (e) {
                e.preventDefault();
                holderOffset = self.sliderArea.offset().left;
                startOffset = self.sliderHandler.offset().left - holderOffset;
                sliderWidth = self.sliderArea.width();
                moveHandler(e);
            });

            /**
             * Allow the user to control the slider from his keyboard
             */
            function keyboardNavigation(e) {
                if (e.keyCode == '37') {
                    moveHandler(e, (self.options.image.scale - 1)/2);
                }
                else if (e.keyCode == '39') {
                    moveHandler(e, (self.options.image.scale + 1)/2);
                }
            }
            /**
             * Calculates the percentage by the slider handler position and then scale the image
             */
            function moveHandler(e, percentage) {
                
                if (!percentage) {
                    var pageX = e.pageX || e.touches[0].pageX;
                    percentage = pageX - holderOffset;
                    percentage = Math.min(Math.max(0, percentage), sliderWidth);
                    percentage = getPercentageOf(percentage, 200);
                }
                scaleImage(percentage);
            }
            /**
             * Unregister the slider events
             */
            function stopHandler() {
                $(document).off('mousemove touchmove', moveHandler);
                $(document).off('mouseup touchend touchleave touchcancel', stopHandler);
                self.sliderHandler.off('keypress');
                self.sliderHandler.off('focus');
                /**
                 * Call the onSliderChange callback
                 */
                if (typeof self.options.onSliderChange === 'function') {
                    self.options.onSliderChange(self.model);
                }
            }
        }
    }
})(window, jQuery);

