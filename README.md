# json2ts

A script running on [myshell](https://github.com/ms-ecology/myshell), make json into typescript defination.

## Usage

```sh
ms add json2ts # add script into myshell
```

**Examples**

```sh
# simple case
ms j2t '{}'
# ts module with name
ms j2t '{ "name": 1 }' People
# complex case
ms j2t '{ a: 1, b: [true], c: [{n: 1}, { n: "", b: 2}, { n: 2, c: true }] }'
# write define into file
ms j2t '{ a: 1, b: [true], c: [{n: 1}, { n: "", b: 2}, { n: 2, c: true }] }' > Test.d.ts
```

