import * as monaco from 'monaco-editor';

const input = monaco.editor.create(document.getElementById('input'), {
  value: "{}",
  language: 'json',
  theme: 'vs-dark'
});

const output = monaco.editor.create(document.getElementById('output'), {
  value: "",
  readOnly: true,
  language: 'typescript',
  theme: 'vs-dark'
});

window.onload = () => {

  let type = ""
  /**
   * 生成tscode
   * @param { object | any[] } obj 对象或者数组
   * @param {string} name 模块名
   * @returns 
   */
  function convert(obj, name) {

    if (obj instanceof Object) {
      switch (type) {
        case 'data':
          Object.keys(obj).forEach(k => {
            const str = JSON.stringify(obj[k])
            genCode(`const ${k} = ref(${str})`)
          })
          break;
        case 'computed':
          Object.keys(obj).forEach(k => {
            let str = obj[k].toString()
            str = str.replace(k+'()', '')
            str = str.replace(k+' ()', '')
            genCode(`const ${k} = computed(() =>${str})`)
          })
          break;
        case 'methods':
          Object.keys(obj).forEach(k => {
            let str = obj[k].toString()
            str = str.replace(k+'()', '')
            str = str.replace(k+' ()', '')
            genCode(`const ${k} = () =>${str}`)
          })
          break;
        case 'watch':
          Object.keys(obj).forEach(k => {
            let ks
            if (k.includes(',')) {
              ks = k.split(',')
            }
            let watchValue = ks ? JSON.stringify(ks) : k
            watchValue = watchValue.replace(/\"|\'/g, '')
            if (obj[k] instanceof Function) {
              let str = obj[k].toString()
              str = str.replace(k, '')
              str = str.replace(/(\(.*\))/, '$1 =>')
              genCode(`watch(${watchValue},${str})`)
            } else {
              let handler = obj[k]['handler'].toString()
              handler = handler.replace('handler', '')
              handler = handler.replace(/(\(.*\))/, '$1 =>')
              delete obj.handler
              genCode(`watch(${watchValue},${handler}, ${JSON.stringify(obj[k])})`)
            }
          })
          break;
        case 'mapStateToRefs':
          const state = obj.state
          genMapCode(state, 'mapStateToRefs')
          break;
        case 'mapGettersToRefs':
          const getters = obj.getters
          genMapCode(getters, 'mapGettersToRefs')
          break;
        case 'mapActions':
          const actions = obj.actions
          genMapCode(actions, 'mapActions')
          break;
        default:
          break;
      }
    }
  }

  function genMapCode (val, key) {
    if (val) {
      genCode(`const {`)
      val.forEach(item => {
        genCode(`  ${item},`)
      })
      genCode(`} = store.${key}([${val.toString()}])`)
    }
  }


  let stack = []
  let res = ''
  function genCode(code) {
    res += code + '\n'
  }
  const btns = [...document.getElementsByTagName('button')]
  btns.forEach((item) => item.addEventListener('click', (el) => {
    if (el.target.id === 'convert') return
    type = el.target.id
    btns.forEach(c => { c.style.background = '' })
    item.style.background = 'red'
  }))

  document.getElementById('convert').addEventListener('click', () => {
    let json = input.getValue()
    stack = []
    res = ''

    try {
      try {
        json = JSON.parse(json)
        monaco.editor.setModelLanguage(input.getModel(), 'json')
      } catch (err) {
        json = new Function(`return ${json}`)()
        monaco.editor.setModelLanguage(input.getModel(), 'javascript')
      }
    } catch (err) {
      alert(err)
    }
    stack.push({
      name: 'tsModule',
      value: json
    })
    try {
      for (let i = 0; i < stack.length; i++) {
        convert(stack[i].value, stack[i].name)
      }
    } catch (err) {
      alert('解析失败：', err)
    }
    output.setValue(res)
  })

  document.getElementById('mapStateToRefs').addEventListener('click', () => {
    input.setValue("{\n  \"state\": [],\n}")
  })
  document.getElementById('mapGettersToRefs').addEventListener('click', () => {
    input.setValue("{\n  \"getters\": [],\n}")
  })
  document.getElementById('mapActions').addEventListener('click', () => {
    input.setValue("{\n  \"actions\": [],\n}")
  })
}