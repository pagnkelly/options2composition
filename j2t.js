const args = process.argv.slice(2)

if (!args[0]) console.error('json2ts needs a json string.')

const simpleTypes = ['string', 'number', 'boolean']

let stack = []

/**
 * 生成tscode
 * @param { object | any[] } obj 对象或者数组
 * @param {string} name 模块名
 * @returns 
 */
function convert(obj, name) {

  if (obj instanceof Array) {
    // array
    let keys = [...new Set(obj.reduce((c, v) => c.concat(Object.keys(v)), []))] // every key been used
    // descibe keys
    let keysDesc = keys.reduce((res, k) => {
      res[k] = {
        types: new Set([]),
        optional: false
      }
      return res
    }, {})
    // process optional && types
    obj.forEach(item => {
      if (typeof item !== 'object' || !item) return // ignore every simple type & arrays
      // once any item not includes some keys in all, make them optional
      keys.filter(k => !Object.keys(item).includes(k)).forEach(k => keysDesc[k].optional = true)
      // generate types
      Object.keys(item).forEach(k => {
        let t = convertSingle(item[k], name, k)
        keysDesc[k].types.add(t)
      })
    })
    genCode(`interface ${name} {`) // start code
    Object.keys(keysDesc).forEach(k => {
      let key = keysDesc[k].optional ? `${k}?` : k // get key with optional
      let type = [...keysDesc[k].types].join(' | ') // get types
      genCode(`  ${key}: ${type};`)
    })
    genCode(`}`) // end code

  } else {
    // object
    genCode(`interface ${name} {`) // start
    Object.keys(obj).forEach(k => {
      let t = convertSingle(obj[k], name, k)
      genCode(`  ${k}: ${t};`) // every key types
    })
    genCode('}\n') // end
  }
}

/**
 * 
 * @param {any[]} arr 数组
 * @param {string} k 键名，只在array中有对象时会使用
 * @param {string} name 模块名
 * @returns 类型
 */
function convertArray(arr, name, k = '') {
  let item = arr[0]
  // string number boolean
  if (simpleTypes.includes(typeof item)) return typeof item
  // null | undefined
  if (!item) return 'any'
  // array
  if (item instanceof Array) {
    return convertArray(item, name, k) + '[]'
  }
  // object
  let objName = name + toCamalCase(k)
  // 去重
  stack.every(e => e.name !== objName) && stack.push({ // process by convert
    name: objName,
    value: arr
  })
  return objName
}

function convertSingle(item, name, k = '') {
  let t = typeof item
  // string number boolean
  if (simpleTypes.includes(t)) return t
  // undefined
  if (t === 'undefined') return 'undefined'
  // null
  if (t === 'object' && !item) return 'null'
  // array
  if (item instanceof Array) {
    let type = convertArray(item, name, k)
    return `${type}[]`
  }
  // object
  if (t === 'object') {
    let objName = name + toCamalCase(k)
    stack.every(e => e.name !== objName) && stack.push({ // process by convert
      name: objName,
      value: item
    })
    return objName
  }
}

function toCamalCase(str) {
  return str.replace(/(^|[-_])+(\w)/g, (...args) => {
    return args[2].toUpperCase()
  })
}

let res = '\n\n'
function genCode(code) {
  res += code + '\n'
}


let json = {}
let params = args[0].replace(/_enter_/g, '\n').replace(/_nbsp_/g, ' ') // myshell will make params in cmd line, here to fix it
try {
  json = JSON.parse(params)
} catch (err) {
  json = new Function(`return ${params}`)()
}
stack.push({
  name: args[1] || 'tsModule',
  value: json
})
try {
  for (let i = 0; i < stack.length; i++) {
    convert(stack[i].value, stack[i].name)
  }
} catch (err) {
  console.log('解析失败：', err)
}
console.log(res)