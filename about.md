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

As you can likely tell from [my blog](/), I'm a programmer! So my claim to fame is that I perform sometimes-useful and sometimes-amusing acts of minor technomancy. I also like experimenting with things that absolutely shouldn't work.

Another thing you might have gathered is that I'm an [*almost*-artist](/drawstuffs). I draw things every once in a while, and those things are usually Pokemon, including my favorite, Oshawott!

And of course, you might also get the gist that I'm a [*maybe*-musician](/moosics). I really appreciate certain types of music, and I want to not only make the things I wish existed, but also to arrange the things that do.

I guess that's it..? Maybe I will put something Actually Useful here someday, but for now, enjoy links to parts of websites that aren't mine!

{% if site.twitter_username %}
## [The Twitters](https://twitter.com/{{site.twitter_username}})
  {% include icon-twitter.html username=site.twitter_username %} -- Not exactly a full stream of conciousness, but you'll find most of the things I work on here first!
{% endif %}

{% if site.github_username %}
## [The GitHubs](https://github.com/{{site.github_username}})
  {% include icon-github.html username=site.github_username %} -- A collection of aspirational abandonded projects
{% endif %}

## GPG keys
I use system-specific GPG keys, all which you can find [here](/assets/archenoth.gpg)!

The included keys in this file are for:
- **Jirachi** - My main desktop system
- **Porygon** - My phone
- **Emolga** - My [*Exceedingly Tiny* laptop](https://twitter.com/Archenoth/status/1170376688972099585)

With these keys, you can actually see which boxes I commit code from, or encrypt things to send my way~