/*-----------------------------------------------------------------
Theme Name: EcomArts
Author: namespace-it
Author URI: https://themeforest.net/user/namespace-it
Version: 1.0.0 
Description: EcomArts - Multipurpose Ecommerce HTML Template <

-------------------------------------------------------------------
JS TABLE OF CONTENTS
-------------------------------------------------------------------

        01. Mobile Menu 
        02. Sidebar Toggle 
        03. Body Overlay  
        04. Sticky Header   
        05. Counterup 
        06. Wow Animation 
        07. Set Background Image Color & Mask 
        08. Global Slider
        09. Back to top    
        10. MagnificPopup  view  
        11. NiceSelect 
        12. Mouse Cursor 
        13. Progress Bar   
        14. Search Popup
        15. Quantity Plus Minus
        16. Preloader  


------------------------------------------------------------------*/

(function ($) {
    "use strict";

    $(document).ready(function () {


        /*-----------------------------------
          01. Mobile Menu  
        -----------------------------------*/
        $('#mobile-menu').meanmenu({
            meanMenuContainer: '.mobile-menu',
            meanScreenWidth: "1199",
            meanExpand: ['<i class="far fa-plus"></i>'],
        });

        $('#mobile-menu2').meanmenu({
            meanMenuContainer: '.mobile-menu',
            meanScreenWidth: "1920",
            meanExpand: ['<i class="far fa-plus"></i>'],
        });


        /*-----------------------------------
          02. Sidebar Toggle  
        -----------------------------------*/
        $(".offcanvas__close,.offcanvas__overlay").on("click", function () {
            $(".offcanvas__info").removeClass("info-open");
            $(".offcanvas__overlay").removeClass("overlay-open");
        });
        $(".sidebar__toggle").on("click", function () {
            $(".offcanvas__info").addClass("info-open");
            $(".offcanvas__overlay").addClass("overlay-open");
        });



        /*-----------------------------------
          03. Body Overlay 
        -----------------------------------*/
        $(".body-overlay").on("click", function () {
            $(".offcanvas__area").removeClass("offcanvas-opened");
            $(".df-search-area").removeClass("opened");;
            $(".body-overlay").removeClass("opened");
        });



        /*-----------------------------------
          04. Sticky Header 
        -----------------------------------*/
        $(window).scroll(function () {
            if ($(this).scrollTop() > 250) {
                $("#header-sticky").addClass("sticky");
            } else {
                $("#header-sticky").removeClass("sticky");
            }
        });



        /*-----------------------------------
          05. Counterup 
        -----------------------------------*/
        $(".counter-number").counterUp({
            delay: 10,
            time: 10000,
        });

        //>> Hero Slider Start <<//
        const heroSlider2 = new Swiper('.hero-slider-2', {
            // Optional parameters
            speed: 3000,
            loop: true,
            slidesPerView: 1,
            autoplay: true,
            effect: 'fade',
            breakpoints: {
                '1600': {
                    slidesPerView: 1,
                },
                '1400': {
                    slidesPerView: 1,
                },
                '1200': {
                    slidesPerView: 1,
                },
                '992': {
                    slidesPerView: 1,
                },
                '768': {
                    slidesPerView: 1,
                },
                '576': {
                    slidesPerView: 1,
                },
                '0': {
                    slidesPerView: 1,
                },
    
                a11y: false,
            },
            navigation: {
                prevEl: ".array-next",
                nextEl: ".array-prev",
            },
    
        });


        /*-----------------------------------
          06. Wow Animation 
        -----------------------------------*/
        new WOW().init();



        /*-----------------------------------
          07. Set Background Image & Mask   
        -----------------------------------*/
        if ($("[data-bg-src]").length > 0) {
            $("[data-bg-src]").each(function () {
                var src = $(this).attr("data-bg-src");
                $(this).css("background-image", "url(" + src + ")");
                $(this).removeAttr("data-bg-src").addClass("background-image");
            });
        }


        if ($('[data-mask-src]').length > 0) {
            $('[data-mask-src]').each(function () {
                var mask = $(this).attr('data-mask-src');
                $(this).css({
                    'mask-image': 'url(' + mask + ')',
                    '-webkit-mask-image': 'url(' + mask + ')'
                });
                $(this).addClass('bg-mask');
                $(this).removeAttr('data-mask-src');
            });
        };



        /*-----------------------------------
          08. Global Slider
        -----------------------------------*/
        function applyAnimationProperties() {
            $('[data-ani]').each(function () {
                var animationClass = $(this).data('ani');
                $(this).addClass(animationClass);
            });

            $('[data-ani-delay]').each(function () {
                var delay = $(this).data('ani-delay');
                $(this).css('animation-delay', delay);
            });
        }

        // Call the animation properties function
        applyAnimationProperties();

        // Function to initialize Swiper
        function initializeSwiper(sliderContainer) {
            var sliderOptions = sliderContainer.data('slider-options');

            console.log("Slider options: ", sliderOptions);

            var previousArrow = sliderContainer.find('.slider-prev');
            var nextArrow = sliderContainer.find('.slider-next');
            var paginationElement = sliderContainer.find('.slider-pagination');
            var numberedPagination = sliderContainer.find('.slider-pagination.pagi-number');

            var paginationStyle = sliderOptions['paginationType'] || 'bullets';
            var autoplaySettings = sliderOptions['autoplay'] === false ? false : (sliderOptions['autoplay'] || {
                delay: 6000,
                disableOnInteraction: false
            });

            var defaultSwiperConfig = {
                slidesPerView: 1,
                spaceBetween: sliderOptions['spaceBetween'] || 24,
                loop: sliderOptions['loop'] !== false,
                speed: sliderOptions['speed'] || 1000,
                initialSlide: sliderOptions['initialSlide'] || 0,
                centeredSlides: !!sliderOptions['centeredSlides'],
                effect: sliderOptions['effect'] || 'slide',
                fadeEffect: {
                    crossFade: true
                },
                autoplay: autoplaySettings,
                navigation: {
                    nextEl: nextArrow.length ? nextArrow.get(0) : null,
                    prevEl: previousArrow.length ? previousArrow.get(0) : null,
                },
                pagination: {
                    el: paginationElement.length ? paginationElement.get(0) : null,
                    type: paginationStyle,
                    clickable: true,
                    renderBullet: function (index, className) {
                        var bulletNumber = index + 1;
                        var formattedNumber = bulletNumber < 10 ? '0' + bulletNumber : bulletNumber;
                        if (numberedPagination.length) {
                            return '<span class="' + className + ' number">' + formattedNumber + '</span>';
                        } else {
                            return '<span class="' + className + '" aria-label="Go to Slide ' + formattedNumber + '"></span>';
                        }
                    },
                },
                on: {
                    slideChange: function () {
                        setTimeout(function () {
                            this.params.mousewheel.releaseOnEdges = false;
                        }.bind(this), 500);
                    },
                    reachEnd: function () {
                        setTimeout(function () {
                            this.params.mousewheel.releaseOnEdges = true;
                        }.bind(this), 750);
                    }
                }
            };

            var finalConfig = $.extend({}, defaultSwiperConfig, sliderOptions);
            console.log("Complete Swiper options: ", finalConfig);

            // Initialize the Swiper instance
            return new Swiper(sliderContainer.get(0), finalConfig);
        }

        // Initialize Swipers on page load
        var swiperInstances = [];
        $('.gt-slider').each(function () {
            var sliderContainer = $(this);
            var swiperInstance = initializeSwiper(sliderContainer);
            swiperInstances.push(swiperInstance);
        });

        // Bootstrap tab show event
        $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
            var targetTab = $(e.target).attr('href');
            $(targetTab).find('.et-slider').each(function () {
                var sliderContainer = $(this);
                if (!sliderContainer[0].swiper) {
                    initializeSwiper(sliderContainer);
                } else {
                    sliderContainer[0].swiper.update();
                }
            });
        });

        // Add click event handlers for external slider arrows based on data attributes
        $('[data-slider-prev], [data-slider-next]').on('click', function () {
            var targetSliderSelector = $(this).data('slider-prev') || $(this).data('slider-next');
            var targetSlider = $(targetSliderSelector);

            if (targetSlider.length) {
                var swiper = targetSlider[0].swiper;

                if (swiper) {
                    if ($(this).data('slider-prev')) {
                        swiper.slidePrev();
                    } else {
                        swiper.slideNext();
                    }
                }
            }
        });

        //>> Hero Slider Start <<//
         if($('.hero-slider-3').length > 0) {
            const heroSlider3 = new Swiper(".hero-slider-3", {
                spaceBetween: 30,
                speed: 3000,
                loop: true,
                autoplay: {
                    delay: 2000,
                    disableOnInteraction: false,
                },
                pagination: {
                    el: ".dot2",
                    clickable: true,
                },
            });
        }

         

        if($('.new-product-slider').length > 0) {
            const newProductSlider = new Swiper(".new-product-slider", {
                spaceBetween: 30,
                speed: 3000,
                loop: true,
                autoplay: {
                    delay: 2000,
                    disableOnInteraction: false,
                },
                breakpoints: {
                    1399: {
                        slidesPerView: 3,
                    },
                    1199: {
                        slidesPerView: 2,
                    },
                    991: {
                        slidesPerView: 2,
                    },
                    767: {
                        slidesPerView: 2,
                    },
                    575: {
                        slidesPerView: 1,
                    },
                    0: {
                        slidesPerView: 1,
                    },
                },
                pagination: {
                    el: ".dot2",
                    clickable: true,
                },
            });
        }

        if($('.popular-category-slider').length > 0) {
            const popularCategorySlider = new Swiper(".popular-category-slider", {
                spaceBetween: 30,
                speed: 3000,
                loop: true,
                breakpoints: {
                    1199: {
                        slidesPerView: 4,
                    },
                    991: {
                        slidesPerView: 3,
                    },
                    767: {
                        slidesPerView: 2,
                    },
                    575: {
                        slidesPerView: 1,
                    },
                    0: {
                        slidesPerView: 1,
                    },
                },
                pagination: {
                    el: ".dot2",
                    clickable: true,
                },
            });
        }

        if($('.jewelry-category-slider').length > 0) {
            const jewelryCategorySlider = new Swiper(".jewelry-category-slider", {
                spaceBetween: 30,
                speed: 3000,
                loop: true,
                breakpoints: {
                    1399: {
                        slidesPerView: 5,
                    },
                    1199: {
                        slidesPerView: 4,
                    },
                    991: {
                        slidesPerView: 3,
                    },
                    767: {
                        slidesPerView: 2,
                    },
                    575: {
                        slidesPerView: 1,
                    },
                    0: {
                        slidesPerView: 1,
                    },
                },
                pagination: {
                    el: ".dot2",
                    clickable: true,
                },
            });
        }

        if($('.food-collection-slider').length > 0) {
            const foodCollectionSlider = new Swiper(".food-collection-slider", {
                spaceBetween: 30,
                speed: 3000,
                loop: true,
                autoplay: {
                    delay: 2000,
                    disableOnInteraction: false,
                },
                breakpoints: {
                    1399: {
                        slidesPerView: 4,
                    },
                    1199: {
                        slidesPerView: 3,
                    },
                    991: {
                        slidesPerView: 3,
                    },
                    767: {
                        slidesPerView: 2,
                    },
                    575: {
                        slidesPerView: 1,
                    },
                    0: {
                        slidesPerView: 1,
                    },
                },
                navigation: {
                    nextEl: ".array-prev",
                    prevEl: ".array-next",
                },
            });
        }

         // Category-click
        $(".bd-category__click").click(function () {
            $(this).siblings(".category__items, .category__items-2").slideToggle();
            $(this).toggleClass("items-open");
        });


        /*-----------------------------------
           09. Back to top    
        -----------------------------------*/
        $(window).on('scroll', function() {
            if ($(this).scrollTop() > 20) {
                $("#back-top").addClass("show");
            } else {
                $("#back-top").removeClass("show");
            }
        });
        
        $(document).on('click', '#back-top', function() {
            $('html, body').animate({ scrollTop: 0 }, 800);
            return false;
        });



        /*-----------------------------------
            10. MagnificPopup  view    
        -----------------------------------*/
        $(".popup-video").magnificPopup({
            type: "iframe",
            removalDelay: 260,
            mainClass: 'mfp-zoom-in',
        });

        $(".img-popup").magnificPopup({
            type: "image",
            gallery: {
                enabled: true,
            },
        });




        /*-----------------------------------
            11. NiceSelect     
        -----------------------------------*/
        if ($('.single-select').length) {
            $('.single-select').niceSelect();
        }



        /*-----------------------------------
            12. Mouse Cursor    
        -----------------------------------*/
        function mousecursor() {
            if ($("body")) {
                const e = document.querySelector(".cursor-inner"),
                    t = document.querySelector(".cursor-outer");
                let n,
                    i = 0,
                    o = !1;
                (window.onmousemove = function (s) {
                    o ||
                        (t.style.transform =
                            "translate(" + s.clientX + "px, " + s.clientY + "px)"),
                        (e.style.transform =
                            "translate(" + s.clientX + "px, " + s.clientY + "px)"),
                        (n = s.clientY),
                        (i = s.clientX);
                }),
                    $("body").on("mouseenter", "a, .cursor-pointer", function () {
                        e.classList.add("cursor-hover");
                        t.classList.add("cursor-hover");
                    }),
                    $("body").on("mouseleave", "a, .cursor-pointer", function () {
                        ($(this).is("a") && $(this).closest(".cursor-pointer").length) ||
                            (e.classList.remove("cursor-hover"),
                                t.classList.remove("cursor-hover"));
                    }),
                    (e.style.visibility = "visible"),
                    (t.style.visibility = "visible");
            }
        }
        $(function () {
            mousecursor();
        });



        /*-----------------------------------
            13. Progress Bar   
        -----------------------------------*/
        // $('.progress-bar').each(function () {
        //     var $this = $(this);
        //     var progressWidth = $this.attr('style').match(/width:\s*(\d+)%/)[1] + '%';

        //     $this.waypoint(function () {
        //         $this.css({
        //             '--progress-width': progressWidth,
        //             'animation': 'animate-positive 1.8s forwards',
        //             'opacity': '1'
        //         });
        //     }, { offset: '75%' });
        // });



        /*--------------------------------------------------
          14. Search Popup
      ---------------------------------------------------*/
        const $searchWrap = $(".search-wrap");
        const $navSearch = $(".nav-search");
        const $searchClose = $("#search-close");

        $(".search-trigger").on("click", function (e) {
            e.preventDefault();
            $searchWrap.animate({ opacity: "toggle" }, 500);
            $navSearch.add($searchClose).addClass("open");
        });

        $(".search-close").on("click", function (e) {
            e.preventDefault();
            $searchWrap.animate({ opacity: "toggle" }, 500);
            $navSearch.add($searchClose).removeClass("open");
        });

        function closeSearch() {
            $searchWrap.fadeOut(200);
            $navSearch.add($searchClose).removeClass("open");
        }

        $(document.body).on("click", function (e) {
            closeSearch();
        });

        $(".search-trigger, .main-search-input").on("click", function (e) {
            e.stopPropagation();
        });


        // brand slider 
        var swiper = new Swiper(".gt-brand-top-active", {
            slidesPerView: 'auto',
            spaceBetween: 30,
            freemode: true,
            centeredSlides: true,
            loop: true,
            speed: 4000,
            allowTouchMove: false,
            autoplay: {
                delay: 1,
                disableOnInteraction: true,
            },
        });


        $('.qty-wrapper').each(function () {
            const $input = $(this).find('.qty-input');
            const $btnPlus = $(this).find('.quantity-plus');
            const $btnMinus = $(this).find('.quantity-minus');

            // Increment value
            $btnPlus.click(function () {
                let currentValue = parseInt($input.val()) || 0;
                const max = parseInt($input.attr('max')) || 100;
                if (currentValue < max) {
                    $input.val(currentValue + 1);
                }
            });

            // Decrement value
            $btnMinus.click(function () {
                let currentValue = parseInt($input.val()) || 0;
                const min = parseInt($input.attr('min')) || 1;
                if (currentValue > min) {
                    $input.val(currentValue - 1);
                }
            });
        });


        //--- Custom Accordion Tabs --- //
        $(".accordion-single .header-area").on("click", function () {
            if ($(this).closest(".accordion-single").hasClass("active")) {
                $(this).closest(".accordion-single").removeClass("active");
                $(this).next(".content-area").slideUp();
            } else {
                $(".accordion-single").removeClass("active");
                $(this).closest(".accordion-single").addClass("active");
                $(".content-area").not($(this).next(".content-area")).slideUp();
                $(this).next(".content-area").slideToggle();
            }
        });
        //--- Custom Accordion Tabs --- //


        /*-----------------------------------
   16. Text Splitting
-----------------------------------*/
        Splitting();



        /*--------------------------------------------------
          15. Quantity Plus Minus
      ---------------------------------------------------*/
        $(".quantity-plus").each(function () {
            $(this).on("click", function (e) {
                e.preventDefault();
                var $qty = $(this).siblings(".qty-input");
                var currentVal = parseInt($qty.val());
                if (!isNaN(currentVal)) {
                    $qty.val(currentVal + 1);
                }
            });
        });

        $(".quantity-minus").each(function () {
            $(this).on("click", function (e) {
                e.preventDefault();
                var $qty = $(this).siblings(".qty-input");
                var currentVal = parseInt($qty.val());
                if (!isNaN(currentVal) && currentVal > 1) {
                    $qty.val(currentVal - 1);
                }
            });
        });

// Range Slider   
        $(document).ready(function () {
            const $rangeInput = $("#customRange");
            const $currentPrice = $("#currentPrice");
          
            function updateSlider() {
              const value = $rangeInput.val();
              const min = $rangeInput.attr("min");
              const max = $rangeInput.attr("max");
          
              // Update the current price
              $currentPrice.text(`$${value}`);
          
              // Calculate percentage for background gradient
              const percentage = ((value - min) / (max - min)) * 100;
          
              // Update slider background with gradient
              $rangeInput.css(
                "background",
                `linear-gradient(90deg, #ff4035 ${percentage}%, #e0e0e0 ${percentage}%)`
              );
            }
          
            // Attach event listener to update on slider movement
            $rangeInput.on("input", updateSlider);
          
            // Initialize on page load
            updateSlider();
          });
          
// Timer
          $(document).ready(function () {
            // Set the target date and time
            const targetDate = new Date().getTime() + (24 * 60 * 60 * 1000); // Example: 24 hours from now
        
            // Update the countdown every second
            setInterval(function () {
                const now = new Date().getTime();
                const timeLeft = targetDate - now;
        
                // Calculate days, hours, minutes, and seconds
                const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
                const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
                // Display the results
                $('#day').text(days);
                $('#hrs').text(hours < 10 ? "0" + hours : hours);
                $('#min').text(minutes < 10 ? "0" + minutes : minutes);
                $('#sec').text(seconds < 10 ? "0" + seconds : seconds);
        
                // If the countdown is over
                if (timeLeft < 0) {
                    clearInterval();
                    $('#day').text("0");
                    $('#hrs').text("00");
                    $('#min').text("00");
                    $('#sec').text("00");
                }
            }, 1000);
        });


        // Timer
        $(document).ready(function () {
            // Set the target date and time (example: 3 days from now)
            const targetDate = new Date().getTime() + (3 * 24 * 60 * 60 * 1000);
        
            // Update the countdown every second
            setInterval(function () {
                const now = new Date().getTime();
                const timeLeft = targetDate - now;
        
                // Calculate days, hours, minutes, and seconds
                const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
                const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
                // Update the UI
                $('.days').text(days);
                $('.hours').text(hours < 10 ? "0" + hours : hours);
                $('.minutes').text(minutes < 10 ? "0" + minutes : minutes);
                $('.sec').text(seconds < 10 ? "0" + seconds : seconds);
        
                // Handle timer expiration
                if (timeLeft < 0) {
                    clearInterval();
                    $('.days').text("00");
                    $('.hours').text("00");
                    $('.minutes').text("00");
                    $('.sec').text("00");
                }
            }, 1000);
        });

        // Timer
        $(document).ready(function () {
            // Set the target date and time (e.g., 5 days from now)
            const targetDate = new Date().getTime() + (5 * 24 * 60 * 60 * 1000);
        
            // Update the timer every second
            setInterval(function () {
                const now = new Date().getTime();
                const timeLeft = targetDate - now;
        
                // Calculate days, hours, minutes, and seconds
                const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
                const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
                // Update the UI
                $('#days').text(days);
                $('#hours').text(hours < 10 ? "0" + hours : hours);
                $('#minutes').text(minutes < 10 ? "0" + minutes : minutes);
                $('#seconds').text(seconds < 10 ? "0" + seconds : seconds);
        
                // Handle timer expiration
                if (timeLeft < 0) {
                    clearInterval();
                    $('#days').text("0");
                    $('#hours').text("00");
                    $('#minutes').text("00");
                    $('#seconds').text("00");
                }
            }, 1000);
        });


        // Timer index3
        $(document).ready(function () {
            // Set the target date and time (e.g., 7 days from now)
            const targetDate = new Date().getTime() + (7 * 24 * 60 * 60 * 1000);
        
            // Update the timer every second
            setInterval(function () {
                const now = new Date().getTime();
                const timeLeft = targetDate - now;
        
                // Calculate days, hours, minutes, and seconds
                const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
                const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
                // Update the UI
                $('#days').text(days);
                $('#hours').text(hours < 10 ? "0" + hours : hours);
                $('#minutes').text(minutes < 10 ? "0" + minutes : minutes);
                $('#seconds').text(seconds < 10 ? "0" + seconds : seconds);
        
                // Handle timer expiration
                if (timeLeft < 0) {
                    clearInterval();
                    $('#days').text("0");
                    $('#hours').text("00");
                    $('#minutes').text("00");
                    $('#seconds').text("00");
                }
            }, 1000);
        });

    }); // End Document Ready Function


    // Offer Modal
    // $(window).on('load', function () {
    //     setTimeout(function () {
    //         $('#exampleModal').modal('show');
    //     }, 500);
    // });

    // Offer Modal
$(window).on('load', function () {
    setTimeout(function () {
        const modal = $('#exampleModal');
        
        // Show the modal
        modal.modal('show');
        
        // Remove aria-hidden when the modal is shown
        modal.on('shown.bs.modal', function () {
            modal.removeAttr('aria-hidden');
            modal.find('[data-focus="true"]').focus(); // Focus on the first focusable element, if specified
        });

        // Add aria-hidden back when the modal is hidden
        modal.on('hidden.bs.modal', function () {
            modal.attr('aria-hidden', 'true');
        });
    }, 500);
});



    /*-----------------------------------
        16. Preloader   
    -----------------------------------*/

    function loader() {
        $(window).on('load', function () {
            // Animate loader off screen
            $(".preloader").addClass('loaded');
            $(".preloader").delay(600).fadeOut();
        });
    }

    loader();




})(jQuery); // End jQuery

