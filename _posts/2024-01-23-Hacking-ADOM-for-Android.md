---
layout: post
title: Hacking ADOM to work on Android
categories: tech
series: "Square peg, round hole:"
---

![Oshawott standing on tippy toes, showing a phone with a victory hand gesture emoji on it](/img/Oshavictory.png  "Success!"){: .imageRight .short}

When I last left off, I wrote a post about [getting as many traditional roguelikes to work on as I could!](/tech/2020/05/29/Roguelikes-in-Termux.html) And while I was successful in accomplishing this for [a](https://github.com/termux/termux-packages/pull/10916) [few](https://github.com/termux/termux-packages/pull/5740) [games](https://github.com/termux/termux-packages/pull/10923) I eventually packaged for Termux, there was still the weirdness that was ADOM, a closed-source game that I wrote a [ptrace wrapper](/tech/2020/05/29/Roguelikes-in-Termux.html#enter-ptrace) in order to play without needing to rely on emulation.

However, it turns out that getting a version of ADOM working on Android without a wrapper not only is possible, it's actually pretty easy!


<!-- more -->

# ADOM, and the problem
[ADOM](https://www.adom.de/home/index.html) is an excellent traditional roguelike created by Thomas Biskup. It features a large open world you can navigate with an overworld map, a narrative with branching storylines, and lots of other things none of the other popular roguelikes of the time had. But, unlike those other roguelikes, it also wasn't open source.

Without source code, how is it possible to play ADOM on Android? Well, cool thing about Android, it actually *does* run ELF binaries when asked nicely. This usually just fails because the binaries you use on other Linuxes have two complications:

1. They are for the wrong architecture
2. They want to use shared libraries that *do not* exist on Android, and that you can't easily install

If those two complications aren't a problem, there's nothing really stopping you from running programs compiled without Android in mind, right?

*Well, almost*, but we'll get to that.

What this does mean is that, *most* statically linked ARM binaries built for Linux will just kinda...work on Android! For example, because of how it works, most Linux-ARM targeting builds of Go programs can run on most phones without modification, or any special environments.

Here's the [Terrapin Vulnerability Scanner](https://github.com/RUB-NDS/Terrapin-Scanner/releases/tag/v1.1.0)'s aarch64 build running without modification on my phone's shell!

[![A screenshot of a Termux terminal on Android showing the Linux Terrapin scanner is a 64-bit ELF built in Go, and then showing that it runs without errors](https://media.chitter.xyz/media_attachments/files/111/699/012/936/463/830/original/5275b34208e10978.png "It runs!")](https://chitter.xyz/@archenoth/111699043164231729)

With that in mind, I should probably mention that there is [a Raspbian version of ADOM](https://www.adom.de/home/downloads.html) freely available on ADOM's website; Raspberry Pi's architecture being *ARM*. This apparently once upon a time, ran without modification on Android, but later, [Android introduced seccomp filters](/tech/2020/05/29/Roguelikes-in-Termux.html#seccomp) to prevent using certain syscalls that Android doesn't support. Syscalls ADOM *wants* to use.

And here lies the problem!

If ADOM calls these syscalls, it dies, but there's no source to remove them. My previous answer to this problem was to ptrace out the syscall, but it turns out, we can do better!

*Much* better.

# radare2 + strace
We can just hack out the system call from the binary itself! And [radare2](https://rada.re/n/), an open source reverse engineering toolkit, that's already installable in Termux means we can do it all on-device! We just need to figure out where the system call is in the binary so we can replicate the strategy of changing seccomp'd syscalls to syscall 0 [from the previous post](/tech/2020/05/29/Roguelikes-in-Termux.html#enter-ptrace)--except this time, not at runtime!

We don't even need to statically analyze it to find out where we need to hack out the call, we get this information for free! We just need the kernel to seccomp kill ADOM while watching it through `strace`!

So, to do this, we can just install both things:

```sh
$ apt install radare2 strace
```

And then run ADOM through `strace`!

```sh
$ wget https://www.adom.de/home/download/current/adom_linux_arm_3.3.3.tar.gz
$ tar xvaf adom_linux_arm_3.3.3.tar.gz
$ cd adom
$ strace ./adom
execve("./adom", ["./adom"], 0xb400007b385d9c50 /* 42 vars */ <unfinished ...>
[ Process PID=25778 runs in 32 bit mode. ]
<... execve resumed>)                   = 0
uname({sysname="Linux", nodename="localhost", ...}) = 0
brk(NULL)                               = 0x265a000
brk(0x265ad08)                          = 0x265ad08
set_tls(0x265a4c0)                      = 0
brk(0x267bd08)                          = 0x267bd08
brk(0x267c000)                          = 0x267c000
getuid32()                              = 10388
setuid32(10388)                         = 10388
--- SIGSYS {si_signo=SIGSYS, si_code=SYS_SECCOMP, si_call_addr=0x1caf70, si_syscall=__NR_setuid32, si_arch=AUDIT_ARCH_ARM} ---
+++ killed by SIGSYS +++
Bad system call
```

Now, look closely at this output. Do you see what I see?

Specifically in this line:

```
--- SIGSYS {si_signo=SIGSYS, si_code=SYS_SECCOMP, si_call_addr=0x1caf70, si_syscall=__NR_setuid32, si_arch=AUDIT_ARCH_ARM} ---
```

Staring at us right in the face is the address of where the binary died to seccomp! `si_call_addr=0x1caf70`.

So, armed with this information, if we can simply jump to that location in the binary in radare2, and replace the syscall number with `0`, we should be golden!

```sh
$ r2 -w ./adom
```

`-w` means we are allowing ourselves to write to the binary, because by default, radare2 doesn't want you to accidentally mangle something you simply want to inspect. But after we are in, we can see r2's extremely minimalist interface.

Since we know exactly where we want to go (`0x1caf70` minus 8 because of the instruction size), we can just `s`eek to it with

```
[0x0000a520]> s 0x1caf70-8
[0x001caf68]>
```

As you may have noticed, you can just do math inline the r2 CLI, which is nice! But now that we're here, we may as well switch to something a little more visual!

There are two other commands we are going to use to navigate r2:
- The `V` command switches us to a `V`isual mode, and...
- `p` switches the `p`rint mode, which are basically just different visual mode styles (I like to think of them as pages)

We are interested in the disassembly, which is the second default print mode, so in order to do both at the same time we can just run

```
[0x001caf68]> Vp
```

This will switch to Visual mode and immediately switch to the fullscreen disassembly view, and at the top of the screen, you should be able to see:

```
[0x001caf68 [xAdvc]0 0% 120 ./adom]> pd $r @ entry0+1837640 # 0x1caf68
       ╎╎   0x001caf68      d570a0e3       mov r7, 0xd5
       ╎╎   0x001caf6c      000000ef       svc 0
```

This is perfect! We are exactly positioned where the `r7` register is getting the syscall number.

We don't want `r7` to be [`0xd5`](https://github.com/torvalds/linux/blob/v4.17/arch/arm/tools/syscall.tbl#L230), since [that's a filtered syscall](https://github.com/aosp-mirror/platform_bionic/blob/2b499046f10487802bfbaaf4429160595d08b22c/libc/SECCOMP_BLACKLIST_APP.TXT#L16) and will die when we `svc 0` the next instruction. So we want to zero that out by hitting `i` to insert hex at our location, and entering `00` (two of them because 2 hex values is 1 byte).

It should look like this after you are done:

```
       ╎╎   0x001caf68      0070a0e3       mov r7, 0
       ╎╎   0x001caf6c      000000ef       svc 0
```

If that looks right, we will have just hacked out that syscall! All that remains is to hit ESC to leave Visual mode, and quit with `q`!

If you've done this, all you need to do to have working ADOM is to just pass in a little terminal environment, and you can play without any wrappers!

```sh
$ TERMINFO=/data/data/com.termux/files/usr/share/terminfo TERM=xterm ./adom
```

This is what it all looks like in one go!

<div class="asciinema">
  <script async id="asciicast-smgPNPEBZU5qYXbzp40ufL7xS" src="https://asciinema.org/a/smgPNPEBZU5qYXbzp40ufL7xS.js"></script>
</div>

# Conclusion
With a tiny amount of `strace` and `r2`, any statically linked ARM ELF that dies because of seccomp on Android can be fixed!

This opens up a gigantic amount of possibilities for running things on Android that you might not have expected could otherwise--but, of course, this also means that, with the power of minor acts of hackery, we are also able to play a fun open world roguelike on the go~

(Speaking of, if you like this game, I feel like the dev would really appreciate your support [on Steam](https://store.steampowered.com/app/333300/ADOM_Ancient_Domains_Of_Mystery/)!)

Happy hacking!
