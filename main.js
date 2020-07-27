import { ToyReact, Component } from './ToyReact'
class MyComponent extends Component {
  constructor(props) {
    super()
  }
  render() {
    // debugger
    console.log('begin')
    return (
      <div id="10">
        <span>hahha</span>
        <span>nihao</span>
        {this.children}
        <span>{true}</span>
      </div>
    )
  }
}
// debugger
const a = (
  <MyComponent>
    <div>111</div>
  </MyComponent>
)
console.log('begin2')
console.log(a)
ToyReact.render(a, document.body)
