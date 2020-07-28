class ELementWrapper {
  constructor(type) {
    this.root = document.createElement(type)
  }
  setAttribute(name, value) {
    if (name.match(/^on([\s\S]+)$/)) {
      const eventName = RegExp.$1.replace(/^[\s\S]/, (s) => {
        return s.toLowerCase()
      })
      this.root.addEventListener(eventName, value)
    }
    if (name.match(/^className$/)) {
      name = 'class'
    }
    this.root.setAttribute(name, value)
  }
  appendChild(vchild) {
    let range = document.createRange()
    if (this.root.children.length) {
      range.setStartAfter(this.root.lastChild)
      range.setEndAfter(this.root.lastChild)
    } else {
      range.setStart(this.root, 0)
      range.setEnd(this.root, 0)
    }
    vchild.mountTo(range)
  }
  mountTo(range) {
    // range.appendChild(this.root)

    range.deleteContents()
    range.insertNode(this.root)
  }
}
class TextWrapper {
  constructor(content) {
    this.root = document.createTextNode(content)
  }
  mountTo(range) {
    // range.appendChild(this.root)
    range.deleteContents()
    range.insertNode(this.root)
  }
}
export let ToyReact = {
  createElement(type, attrubutes, ...children) {
    let element
    if (typeof type === 'string') {
      element = new ELementWrapper(type)
    } else {
      element = new type()
    }
    for (const key in attrubutes) {
      element.setAttribute(key, attrubutes[key])
    }
    let insertChildren = (children) => {
      for (const child of children) {
        if (typeof child === 'object' && child instanceof Array) {
          insertChildren(child)
        } else {
          if (
            !(child instanceof TextWrapper) &&
            !(child instanceof Component) &&
            !(child instanceof ELementWrapper)
          ) {
            child = String(child)
          }
          if (typeof child === 'string') {
            child = new TextWrapper(child)
          }
          element.appendChild(child)
        }
      }
    }
    insertChildren(children)
    return element
  },
  render(vdom, element) {
    let range = document.createRange()
    if (element.children.length) {
      range.setStartAfter(element.lastChild)
      range.setEndAfter(element.lastChild)
    } else {
      range.setStart(element, 0)
      range.setEnd(element, 0)
    }
    vdom.mountTo(range)
  }
}
export class Component {
  constructor() {
    this.props = Object.create(null)
    // 这里是用Object.create(null)是为了创建一个空的OJ对象，比较纯净，没有object的一些tostring等方法
    this.children = []
  }
  setAttribute(name, value) {
    this.props[name] = value
    this[name] = value
  }
  mountTo(range) {
    this.range = range
    this.update()
  }
  update() {
    // 由于删除造成位置上的变动，所以我们创建一个注释节点插入，保存住位置
    const placeholder = document.createComment('placeholder')
    const range = document.createRange()
    range.setStart(this.range.endContainer, this.range.endOffset)
    range.setEnd(this.range.endContainer, this.range.endOffset)
    range.insertNode(placeholder)
    this.range.deleteContents()
    const vdom = this.render()
    vdom.mountTo(this.range)
  }
  appendChild(vchild) {
    this.children.push(vchild)
  }
  setState(state) {
    const merge = (oldState, newState) => {
      for (const key in newState) {
        if (typeof newState[key] === 'object') {
          if (typeof oldState[key] !== 'object') {
            oldState[key] = {}
          }
          merge(oldState[key], newState[key])
        } else {
          oldState[key] = newState[key]
        }
      }
    }
    if (!this.state && state) {
      this.state = {}
    }
    merge(this.state, state)
    this.update()
    console.log(this.state)
  }
}
