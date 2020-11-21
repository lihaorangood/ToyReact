class ELementWrapper {
  constructor(type) {
    this.type = type
    this.children = []
    this.props = {}
  }
  get vdom() {
    return this
  }
  setAttribute(name, value) {
    // if (name.match(/^on([\s\S]+)$/)) {
    //   const eventName = RegExp.$1.replace(/^[\s\S]/, (s) => {
    //     return s.toLowerCase()
    //   })
    //   this.root.addEventListener(eventName, value)
    // }
    // if (name.match(/^className$/)) {
    //   name = 'class'
    // }
    // this.root.setAttribute(name, value)
    this.props[name] = value
  }

  appendChild(vchild) {
    // let range = document.createRange()
    // if (this.root.children.length) {
    //   range.setStartAfter(this.root.lastChild)
    //   range.setEndAfter(this.root.lastChild)
    // } else {
    //   range.setStart(this.root, 0)
    //   range.setEnd(this.root, 0)
    // }
    // vchild.mountTo(range)
    this.children.push(vchild.vdom)
  }
  mountTo(range) {
    // range.appendChild(this.root)
    this.range = range
    let endRange = document.createRange()
    endRange.setStart(range.endContainer, range.endOffset)
    endRange.setEnd(range.endContainer, range.endOffset)
    endRange.insertNode(document.createComment('placeholder'))
    range.deleteContents()
    // 将Vdom实例化，进行插入DOM树中
    const element = document.createElement(this.type)
    // 经属性和child都通过循环添加到element的对应位置
    for (let name in this.props) {
      let value = this.props[name]
      if (name.match(/^on([\s\S]+)$/)) {
        const eventName = RegExp.$1.replace(/^[\s\S]/, (s) => {
          return s.toLowerCase()
        })
        element.addEventListener(eventName, value)
      }
      if (name.match(/^className$/)) {
        name = 'class'
      }
      element.setAttribute(name, value)
    }
    for (const child of this.children) {
      let range = document.createRange()
      if (element.children.length) {
        range.setStartAfter(element.lastChild)
        range.setEndAfter(element.lastChild)
      } else {
        range.setStart(element, 0)
        range.setEnd(element, 0)
      }
      child.mountTo(range)
    }
    range.insertNode(element)
  }
}
class TextWrapper {
  constructor(content) {
    this.root = document.createTextNode(content)
    this.type = '#text'
    this.props = Object.create(null)
    this.children = []
  }
  get vdom() {
    return this
  }
  mountTo(range) {
    // range.appendChild(this.root)
    this.range = range
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
          if (child === null || child == void 0) {
            child = ''
          }
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
  get type() {
    return this.constructor.name
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
    const vdom = this.vdom
    const isSameNode = (node1, node2) => {
      if (node1.type !== node2.type) return false
      for (let key in node1.props) {
        /*if (
          typeof node1.props[key] === 'function' &&
          typeof node2.props[key] === 'function' &&
          node1.props[key].toString() === node2.props[key].toString()
        ) {
          continue
        }*/
        if (
          typeof node1.props[key] === 'object' &&
          typeof node2.props[key] === 'object' &&
          JSON.stringify(node1.props[key]) === JSON.stringify(node2.props[key])
        ) {
          continue
        }
        if (node1.props[key] !== node2.props[key]) return false
      }
      if (Object.keys(node1.props).length !== Object.keys(node2.props).length)
        return false
      return true
    }
    const isSameTree = (nodeTree1, nodeTree2) => {
      if (!isSameNode(nodeTree1, nodeTree2)) return false
      if (nodeTree1.children.length !== nodeTree2.children.length) return false
      for (let i = 0; i < nodeTree1.children.length; i++) {
        if (!isSameTree(nodeTree1.children[i], nodeTree2.children[i]))
          return false
      }
      return true
    }
    const replace = (newTree, oldTree) => {
      if (isSameTree(newTree, oldTree)) {
        return
      }
      if (!isSameNode(newTree, oldTree)) {
        newTree.mountTo(oldTree.range)
      } else {
        // 进行for循环比对children中的每一项，进行单个更新
        for (let i = 0; i < newTree.children.length; i++) {
          replace(newTree.children[i], oldTree.children[i])
        }
      }
    }
    if (this.oldVdom) {
      replace(vdom, this.oldVdom)
    } else {
      vdom.mountTo(this.range)
    }
    this.oldVdom = vdom
  }
  get vdom() {
    return this.render().vdom
  }
  appendChild(vchild) {
    this.children.push(vchild)
  }
  setState(state) {
    const merge = (oldState, newState) => {
      for (const key in newState) {
        if (typeof newState[key] === 'object' && newState[key] !== null) {
          if (newState[key] instanceof Array) {
            oldState[key] = []
          }
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
  }
}
