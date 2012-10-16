Install

```
npm install workmode -g
```

Add site to block list

```
  workmode add news.ycombinator.com
```

Start workmode

```
  workmode start
```

Stop workmode

```
  workmode stop
```

List blocked sites

```
  workmode list
```

Remove site

```
  workmode remove news.ycombinator.com
```

You can also remove site by number

```
$ workmode list
[1] www.facebook.com
[2] news.ycombinator.com
[3] twitter.com
$ workmode remove 3
site removed: twitter.com
```
Status of the workmode

```
workmode status
```