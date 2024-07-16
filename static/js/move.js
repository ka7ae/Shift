$(window).on('load', function() {

    var tl = gsap.timeline({
        paused: true
      }),
      tlback = gsap.timeline({
        paused: true
      });

    tl
      .set('.home', { className: '+=active'})
      .set('.item_profile', { scale: 1 })
      .set('.item_create_shift', { scale: 1 })
      .set('.item_shift', { scale: 1 })
      .set('.logout-button', { scale: 1 }) // fix for a bug when on of the item was appearing at 0.5 scale
      .to('.home', 0.1, {
        scale: 1.0,
        yoyo: true,
        repeat: 1
      })
      .to('.home', 0.1, {
        x: 10,
        y: 10,
        // ease: Elastic.easeOut.config(1, 0.5)
        ease: "elastic.out(1, 0.5)"
      }, 0)

      .staggerFrom(['.item_profile', '.item_create_shift', '.item_shift', '.logout-button'], 0.7, {
        left: 10,
        top: 10,
        autoAlpha: 0,
        scale: 0.5,
        ease: "elastic.out(1, 0.5)"
      }, 0.2);

    
  
    tlback
      .set('.home', { className: '-=active' })
      .staggerTo(['.item_profile', '.item_create_shift', '.item_shift', '.logout-button'], 0.7, {
        left: 10,
        top: 10,
        autoAlpha: 0,
        scale: 0.5,
        ease: "elastic.out(1, 0.5)"
      }, 0.2)
      .to('.home', 0.1, {
        x: 10,
        y: 10,
        // ease: Power2.easeOut
        ease: "power2.out"
      }, 0.5);
  
    $(document).on('click', '.home:not(.active)', function(e) {
      // event.preventDefault();
      e.preventDefault();
      tl.play(0);
    });
  
    $(document).on('click', '.home.active, .item_profile, .item_create_shift, .item_shift, .logout-button', 
      function(e) {
      // event.preventDefault();
      e.preventDefault();
      // TweenMax.to($(this), 0.1, {
      gsap.to($(this), 0.3, {
        scale: 1.0,
        yoyo: true,
        // yoyo: false,
        repeat: 1,
        onComplete: function() {
          tlback.play(0)

          var target = $(e.target).closest('a, button');

          if (target.hasClass('logout-button')) {
              target.closest('form').submit();
          } else {
              window.location.href = target.attr('href');
          }
        }
      });
    });
  
  });

