; (function (window, $, undefined) {
    if (!window.profilePicture) {
        window.profilePicture = profilePicture;
    }

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
            scale: null
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
            getData: getData
        };

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

        function isAdvancedUpload() {
            var div = document.createElement('div');
            return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
        };

        /**
         * Load the image info an set image source
         */
        function loadImage(imageUrl) {

            self.model.imageSrc = imageUrl;
            self.photoImg.attr('src', imageUrl)
                .removeClass('hide')
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
                    resetSlider();
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
            var ratio = getPercentageOf(self.options.slider.minValue,self.options.slider.maxValue) * 2;
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
                console.log((newWidth - parent.outerWidth()));
                left = Math.abs((newWidth - parent.outerWidth())) * -1;
            }
            /**
             * Limit the area to drag vertically
             */
            if (top >= 0) {
                top = 0;
            } else if (newHeight + (top - parentTop) < parentHeight) {
                top = Math.abs((newHeight - parentHeight)) * -1;
            }

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
            if (!self.options.image.scale) return;

            var newSize = calcNewImageSize(self.options.image.scale);

            /**
             * Limit the image size
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
        }


        /**
         * Convert scale value to percentage
         */
        function getPercentageOf(val, max) {
            return parseInt(((val * 100) / max).toFixed(0));
        }

        /**
         * Register events
         */
        function init(cssSelector, imageFilePath, options) {

            if (imageFilePath) {
                loadImage(imageFilePath);
            } else {
                self.photoArea.addClass('photo--empty');
            }

            if (isAdvancedUpload) {
                self.element.addClass('is-advanced-upload');
            } else {
                self.element.addClass('is-simple-upload');
            }

            self.options = $.extend({}, self.defaults, options);

            registerDropZoneEvents();
            registerImageDragEvents();
            registerSliderControlEvents();
        }

        /**
         * Register the file drop zone events 
         */
        function registerDropZoneEvents() {
            var target = null;

            function readFile(file) {

                self.photoArea.removeClass('photo--error photo--error--file-type photo--error-image-size');

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

            self.element.on('drag dragstart dragend dragover dragenter dragleave drop', function (e) {
                e.preventDefault();
                e.stopPropagation();
                e.originalEvent.dataTransfer.dropEffect = 'copy';
            });

            self.element.on('dragend dragleave drop', function (e) {
                if (target === e.target) {
                    self.element.removeClass('is-dragover');
                }
            });

            self.element.on('dragover dragenter', function (e) {
                target = e.target;
                self.element.addClass('is-dragover');
            });

            self.element.on('change', 'input[type=file]', function (e) {
                if (this.files && this.files.length) {
                    readFile(this.files[0]);
                    this.value = '';
                }
            });

            self.element.on('click', '.photo--empty .photo__circle', function (e) {
                $(cssSelector + ' input[type=file]').trigger('click');

            });

            self.element.on('click', '.remove', function (e) {
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
            });

            self.element.on('drop', function (e) {
                readFile(e.originalEvent.dataTransfer.files[0]);
            });
        }
        /**
         * Register the image drag events
         */
        function registerImageDragEvents() {
            var $target, x, y;

            self.photoImg.on("mousedown", function (e) {
                $target = $(e.target);
                /**
                 * Firefox
                 */
                if (e.offsetX == undefined) {
                    x = e.pageX - $(this).offset().left;
                    y = e.pageY - $(this).offset().top;
                } else {
                    x = e.offsetX;
                    y = e.offsetY;
                };

            });

            $(document).on("mouseup", function (e) {
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

            $(document).on("mousemove", function (e) {
                if ($target) {
                    var top = (e.pageY) - y;
                    var left = (e.pageX) - x;
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
             * Allow the user to control the slider from his keyboard
             */
            function keyboardNavigation(e) {
                if (e.keyCode == '37') {
                    moveHandler(e, self.sliderHandler.position().left - 1);
                }
                else if (e.keyCode == '39') {
                    moveHandler(e, self.sliderHandler.position().left + 1);
                }
            }

            self.sliderHandler.on('keydown', keyboardNavigation);

            self.sliderHandler.on('mousedown focus', function (e) {

                holderOffset = self.sliderArea.offset().left;
                startOffset = self.sliderHandler.offset().left - holderOffset;
                sliderWidth = self.sliderArea.width();

                $(document).on('mousemove', moveHandler);
                $(document).on('mouseup blur', stopHandler);
            });

            function moveHandler(e, posX) {
                if (!posX) {
                    posX = e.pageX - holderOffset;
                    posX = Math.min(Math.max(0, posX), sliderWidth);
                }
                if (posX <= 0) {
                    self.slider.addClass('slider--minValue');
                    posX = 0;
                } else {
                    self.slider.removeClass('slider--minValue');
                }
                if (posX >= 200) {
                    self.slider.addClass('slider--maxValue');
                    posX = 200;
                } else {
                    self.slider.removeClass('slider--maxValue');
                }
                
                self.sliderHandler.css({
                    left: getPercentageOf(posX, 200) + '%'
                });

                
                self.options.image.scale = posX;

                resizeImage();
            }
            function stopHandler() {
                $(document).off('mousemove', moveHandler);
                $(document).off('mouseup', stopHandler);
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
