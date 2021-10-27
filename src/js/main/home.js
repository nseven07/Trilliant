// Global
import Glide, { on } from '@glidejs/glide';
import IMask from 'imask';
import Global from '../base/_global';

// Modules Import
import Counter from '../base/modules/_counter';
import Form from '../base/modules/_form';

export default class Home {

    constructor() {
        new Global();
        this.videoSlider = null;       
        this.gallerySlider = null;
        this.videoSliderMount = false;
        this.gallerySliderMount = false;

        this.maskedElements = [];
        this.enableSlider();
        this.enableContactForm();
        this.enableSideForm();
        this.accordionEvents();
        
       

    }
    enableSlider() {

      const firstSlide = new Glide('.first-slider',{
        startAt: 1,
      });

        const newsSlide = new Glide('.news-slider');

        this.gallerySlider = new Glide('#gallery-slider', {
            perView:3,
            type:'carousel',
            focusAt: 'center',
            peek:-220
        });

        const archSlider = new Glide('.arch-slider');
        const propGallerySlide = new Glide('.prop-gallery-slide');
        this.videoSlider = new Glide('#video-slider', {
          perView:3,
          type:'carousel',
          peek:-220,
          center:1,
        });
        
        const highlightSlider = new Glide('.highlights-slider')

        const archSliderLeft = new Glide('.arch-slider-left')

        archSliderLeft.mount()
        highlightSlider.mount()
        this.videoSlider.mount()
        propGallerySlide.mount()
        this.gallerySlider.mount()
        archSlider.mount()
        firstSlide.mount()
        newsSlide.mount()
        
        
    };
    accordionEvents() {

      const collapses = document.body.querySelectorAll('#gallery-list .collapse')

      for (const collapse of collapses) {

        const glide = collapse.children[0].id;

        $(collapse).on('shown.bs.collapse', ()=>{

          if (glide === 'video-slider') {
            if ( this.videoSliderMount ) {
              
             
            }else {
              this.videoSlider.mount()
              this.videoSliderMount = true
            }
            
          }
          else{
        
            if ( this.gallerySliderMount ) {

              
            }
            else {
              this.gallerySliderMount = true
              this.gallerySlider.mount()
            }
          }

        })

        $(collapse).on('hidden.bs.collapse', ()=> {
          if (glide === 'gallery-slider') {
            if ( this.gallerySliderMount ) {
                
              this.gallerySlider.destroy()
              this.gallerySliderMount = false
            }
          }
          else {
              if (this.gallerySliderMount) {

                  this.videoSlider.destroy()
                  this.videoSliderMount = false

            }              
          }
        })

      }
    }
    enableContactForm() {
       
        const phoneMaskOptions = {
          mask: '{5}00 000 00 00',
          startsWith: '5',
          lazy: false
        };

        const stringMaskOptions = {
            mask: /^[a-zA-ZğüşöçıİĞÜŞÖÇ]+$/
          };

        const emailMaskOptions = {
            mask: /^\S*@?\S*$/
          };

        const phone = document.getElementById('phone');
        const phoneMask = new IMask(phone, phoneMaskOptions);
        this.maskedElements.push(phoneMask);

        const firstname = document.getElementById('firstname');
        const firstnameMask = new IMask(firstname, stringMaskOptions);
        this.maskedElements.push(firstnameMask);
        
        const lastname = document.getElementById('lastname');
        const lastnameMask = new IMask(lastname, stringMaskOptions);
        this.maskedElements.push(lastnameMask);

        const email = document.getElementById('email');
        const emailMask = new IMask(email, emailMaskOptions);
        this.maskedElements.push(emailMask);

        new Form('contact-form', this);
    };
    enableSideForm(){

      const btn = document.getElementsByClassName('contact-side-main')[0]

      btn.addEventListener("click", (e)=>{

        if ( btn.classList.contains('contact-side--active') ) {

          btn.classList.remove('contact-side--active')

        }
        else {

          btn.classList.add('contact-side--active')

        }
        
      });
    }
    
}
new Home(); 

