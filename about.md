---
layout: page
title: About
permalink: /about/
---

Oh, hi!

Welcome to my humble little corner of the net!

The name's Archenoth, and as corny as it sounds, I want to make things that can make others happy!

# What kinds of things though?
![Comfywott](/img/Comfywott.png "Oshawott!")
<style>
  img[alt=Comfywott]{
    float: right;
    margin-left: 100px;
    margin-bottom: 50px;
  }

  @media only screen and (max-width: 1400px) and (min-width: 600px) {
    img[alt=Comfywott]{
      max-width: 40%;
    }
  }
</style>

As you can likely tell from [my blog](/), I am a programmer! So my claim to fame is that I perform sometimes-useful and sometimes-amusing acts of minor technomancy. I also like experimenting with things that absolutely shouldn't work.

Another thing you might have gathered is that I'm an [*almost*-artist](/drawstuffs). I draw things every once in a while, and those things are usually Pokemon, including my favorite, Oshawott!

And of course, you might also get the gist that I'm a [*maybe*-musician](/moosics). I really appreciate certain types of music, and I want to not only make the things I wish existed, but also to arrange the things that do.

I guess that's it..? Maybe I will put something Actually Useful here someday, but for now, enjoy links to parts of websites that aren't mine!

{% if site.twitter_username %}
### [The Twitters](https://twitter.com/{{site.twitter_username}})
  {% include icon-twitter.html username=site.twitter_username %} -- If
  you ever wondered what goes through my mind on a day-to-day basis,
  you might be somewhere near something that resembles luck.
{% endif %}

{% if site.github_username %}
### [The GitHubs](https://github.com/{{site.github_username}})
  {% include icon-github.html username=site.github_username %} -- Code
  incarnate, and very occasionally reincarnate.
{% endif %}
