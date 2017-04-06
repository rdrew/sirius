(function (Drupal, $) {
  'use strict';

  $('.expander-trigger').click(function(){
    $(this).toggleClass("expander-hidden");
  });

  $('.region-sidebar-first').slicknav({ label: 'Menu' });

  $('input#edit-menu-enabled').prop('checked', true);
})(Drupal, jQuery);
