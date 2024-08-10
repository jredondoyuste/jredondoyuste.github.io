#!/bin/sh

load_fn="tex_figs/$1/$1.pdf"
save_fn="figs/$1.png"

magick -density $2 $load_fn -alpha on  $save_fn