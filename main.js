import { ToyReact, Component } from './ToyReact'
// class MyComponent extends Component {
//   constructor(props) {
//     super()
//   }
//   render() {
//     // debugger
//     console.log('begin')
//     return (
//       <div id="10">
//         <span>hahha</span>
//         <span>nihao</span>
//         {this.children}
//         <span>{true}</span>
//       </div>
//     )
//   }
// }
// debugger
// const a = (
//   <MyComponent>
//     <div>111</div>
//   </MyComponent>
// )
class Square extends Component {
  constructor(props) {
    super(props)
    this.state = {
      value: null
    }
  }
  render() {
    return (
      <button
        className="square"
        onClick={() =>
          this.setState({
            value: '1'
          })
        }
      >
        {this.state.value ? this.state.value : ''}
      </button>
    )
  }
}

class Board extends Component {
  renderSquare(i) {
    return <Square value={i} />
  }

  render() {
    const status = 'Next player: X'

    return (
      <div>
        <div className="status">{status}</div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    )
  }
}
const a = <Board />
ToyReact.render(a, document.body)
