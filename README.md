# Redactor Plugins

This repo contains a few of the custom redactor plugins I've written, for Redactor II.

Most of these plugins modify core Redactor functions, so they may break with Redactor updates. These have been tested up to Redactor II 1.2.0.

##redactor_align.js

This plugin adds an alignment button to the toolbar, allowing you to align text left, right, center, or justified. It brings back functionality of Redactor I.

##redactor_clips.js

This plugin slightly modifieds the official clips plugin to bring back the old clips plugin functionality from Redactor I, specifically pulling the modal contents from a hidden `div` on the page.

##redactor_general_fix.js

This plugin fixes some bugs and issues that others may encounter: 

* It stops Redactor from stripping `b`, `i`, `span`, or `font` tags.
* It fixes a bug where `style` tags were removed if you deleted a character in the visual editor.
* It fixes a bug where if you repeatedly clicked to open and close a dropdown menu the menu would be stuck open
* It fixes buggy `shift-enter` behavior, ensuring the resulting `br` tag is outputted after the cursor, not before.

##redactor_image_email.js

This plugin adds features to image editing in Redactor, with a focus on creating images suitable for HTML email. This plugin  adds:

* responsive code for all images (`max-width` and `width:100%;`)
* a source input when uploading or editing images, allowing you to use a URL instead of uploading
* a width input box allowing you to set an images width (in pixels or any other CSS complaint value)
* storage of the image's width as `width` attributes, for older HTML email clients
* prevention of image drag resizing in Internet Explorer

##redactor_image.js

Similar to the above plugin, this updates Redactor's image editing capabilities for use outside of HTML email. It adds:

* a source input when uploading or editing images, allowing you to use a URL instead of uploading
* a width input box allowing you to set an images width (in pixels or any other CSS complaint value)
* prevention of image drag resizing in Internet Explorer

##redactor_link_fix.js

This plugin makes two changes to links:

* It fixes a bug in link tooltips where if the link were more than one line the tooltip would cover part of the link.
* It removes validation for links, making it possible to use templated links as your `href` such as `{{ templated_link }}`.
