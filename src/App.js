import React, { Component } from 'react';
import logo from './logo.svg';
import './App.scss';

// -------------------------------------------------------------------------------
// ------------------------------ RANDOM FUNCTIONS -------------------------------
// -------------------------------------------------------------------------------

let clicked = false;

document.onmousedown = function() {
  clicked = true;
}

document.onmouseup = function() {
  clicked = false;
}

const firstLetterUp = str => {
  const newStr = str.replace(str[0], str[0].toUpperCase());
  return newStr;
};

const jsonToDOMElement = str => {
  let wrapper= document.createElement('div');
  wrapper.innerHTML= str;
  const cellsSavedDOM = Array.from(wrapper.children);
  
  return cellsSavedDOM;
};

// -------------------------------------------------------------------------------
// ------------------------------ COMPONENTS -------------------------------------
// -------------------------------------------------------------------------------
const PasteDrawing = props => {
  return (
    <div className="interface__pasteDrawingContainer__compContainer">
      <textarea></textarea>
      <div className="interface__pasteDrawingContainer__compContainer__btn" onClick={props.onClick}>Click</div>
    </div>
  )
};

const ToggleGridBtn = props => {
  return (
    <div className="toggleGridContainer">
      <h3 className="toggleGridContainer__title">Grid display</h3>
      <label className="switch">
        <input type="checkbox" onChange={props.onChange}/>
        <span className="slider round"></span>
      </label>
    </div>
  )
};

const BtnSize = props => {
  const btnClass = "cellSizeBtn interface__cellSize__" + props.size;
  const sizeText = firstLetterUp(props.size);
  
  return (
    <div className={btnClass} onClick={props.onClick} data-size={props.sizePx}>{sizeText}</div>
  )
};

const CellsSizeCustomizer = props => {
  return (
    <div className="interface__cellSize">
      <h3 className="interface__cellSize__title">Cells width</h3>
      <div className="interface__cellSize__containerBtns">
        <BtnSize size="small" sizePx="10" onClick={props.onClick}/>
        <BtnSize size="medium" sizePx="22" onClick={props.onClick}/>
        <BtnSize size="large" sizePx="48" onClick={props.onClick}/>
      </div>
    </div>
  )
};

const Cell = props => {
  return (
    <div className="cell" onMouseOver={props.onMouseOver} onClick={props.onClick} ></div>
  )
};


// -------------------------------------------------------------------------------
// ------------------------------ MAIN COMPONENT ---------------------------------
// -------------------------------------------------------------------------------
class Drawing extends Component {
  constructor(props) {
    super(props);

    const drawing = localStorage.getItem('drawing' + props.num) ? JSON.parse(localStorage.getItem('drawing' + props.num)) : [];
    const cellsSavedDOM = jsonToDOMElement(drawing);

    const cellsSize = cellsSavedDOM[0] ? parseInt(cellsSavedDOM[0].style.width) : 10;

    this.state = {
      currentColor: "red",
      cellsSize: cellsSize,
      drawing: cellsSavedDOM,
      isGrid: true,
      bgColor: "white",
      boardNum: props.num,
      eraser: false,
    };
  };
  
  fillCellClick = e => {
      e.target.style.background = e.target.style.background === "" ? this.state.currentColor : "";
  };

  fillCellOver = e => {
    if (clicked) {
      if (this.state.eraser) {
        e.target.style.background = "";
      } else {
        e.target.style.background = this.state.currentColor;
      }
    }
  };
  
  reSizeCells = e => {
    const newSize = e.target.getAttribute('data-size');
    this.cleanCells();
     
    this.setState({
      cellsSize: parseInt(newSize)
    })
  };

  componentDidUpdate(prevProps, prevState) {
    const cells = document.querySelectorAll('.cell');
    
    if (prevState.drawing !== this.state.drawing) {
      const cellsSaved = this.state.drawing;
      
      for (let i = 0; i < cells.length; i++) {
        cells[i].style.background = cellsSaved[i] ? cellsSaved[i].style.background : "";
      }
    }
    
    for (let i = 0; i < cells.length; i++) {
      cells[i].style.width = this.state.cellsSize + 'px';
      cells[i].style.height = this.state.cellsSize + 'px';
      cells[i].style.borderColor = !this.state.isGrid ? cells[i].style.background ? cells[i].style.background : this.state.bgColor : "";
    }
    
    document.querySelector('.grid').style.background = this.state.bgColor;
  };

  componentDidMount() {
    const cells = document.querySelectorAll('.cell');
    const cellsSaved = this.state.drawing;
    
    for (let i = 0; i < cells.length; i++) {
      cells[i].style.width = this.state.cellsSize + 'px';
      cells[i].style.height = this.state.cellsSize + 'px';
      cells[i].style.background = cellsSaved[i] ? cellsSaved[i].style.background : "";
    }    
  };

  cleanCells = e => {
    const cells = document.querySelectorAll('.cell');
    
    for (let i = 0; i < cells.length; i++) {
      cells[i].style.background = "";
    }
  };
  
  changeCellColor = e => {
    this.setState({
      currentColor: e.target.value,
    })
  };
  
  saveDrawing = e => {
    const cellsNodeList = document.querySelectorAll('.cell');
    const cells = [];
    
    for (let i = 0; i < cellsNodeList.length; i++) {
      cells.push(cellsNodeList[i].outerHTML);
    }
    
    localStorage.setItem('drawing' + this.state.boardNum, JSON.stringify(cells));
  };
  
  isGridDisplayed = e => {
    this.setState({
      isGrid: !this.state.isGrid
    });
  };

  newDrawing = e => {
    const pasteDrawing = JSON.parse(e.target.previousSibling.value);
    const cellsSavedDOM = jsonToDOMElement(pasteDrawing);

    this.setState({
      drawing: cellsSavedDOM,
    });
    
    e.target.previousSibling.value = "";
  };

  changeBgColor = e => {
    this.setState({
      bgColor: e.target.value,
    })
  };

  eraserOn = () => {
    this.setState({
      eraser: !this.state.eraser
    });
  }
  
  render() {
    const gridSize = 600;
    let cells = [];
    
    const numberOfCells = Math.pow((gridSize / (this.state.cellsSize + 2)), 2);
    
    for (let i = 0; i < numberOfCells; i++) {
      const cell = <Cell key={i} onMouseOver={this.fillCellOver} onClick={this.fillCellClick} />
      cells.push(cell);
    };
    
    return (
      <div className="container">
        <div className="grid">
          {cells}
        </div>
        
        <div className="interface">
          <h2 className="interface__title">Customizer</h2>
          
          <div className="traitL"></div>
          
          <div className="interface__btnsContainer">
            <CellsSizeCustomizer onClick={this.reSizeCells} />
            <div className="traitS"></div>
            
            <ToggleGridBtn onChange={this.isGridDisplayed} />
            <div className="traitS"></div>
            
            <div className="interface__colorsContainer">
              <h3 className="interface__colorsContainer__title">Colors</h3>
              <div className="interface__colorsContainer__inputContainer">
                <div className="interface__colorsContainer__penContainer">
                  <h4 className="interface__colorsContainer__penContainer__title">Pen</h4>
                  <input className="interface__colorsContainer__penContainer__input" type="color" onChange={this.changeCellColor}/>                
                </div>
                <div className="traitUp"></div>
                <div className="interface__colorsContainer__bgContainer">
                  <h4 className="interface__colorsContainer__bgContainer__title">Background</h4>
                  <input className="interface__colorsContainer__bgContainer__input" type="color" onChange={this.changeBgColor}/>
                </div>
              </div>
            </div>
            <div className="traitS"></div>
            
            <div className="interface__erasersContainer">
              <h3 className="interface__erasersContainer__title">Erasers</h3>
              <div className="interface__erasersContainer__btnsContainer">
                <div className="interface__erasersContainer__eraserContainer">
                  <h4 className="interface__erasersContainer__eraserContainer__title">Eraser</h4>
                  <label>
                    <input className="interface__erasersContainer__eraserContainer__input" type="checkbox" onChange={this.eraserOn} />
                    <div><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAJLSURBVGhD7ZnJalRBGEbbAZxnfQp37nwGhydw7VIQlw6oIFkEJ5wVBd2oWYi4cEhwSFSCxAk3vosger7FDz9Fdeferiq6AnXgbCqk6j8ht/v27UGj0Wg0RrAPT+FNPIl7cUWxAZ/iv8C/eAnXYPVsxDcYRngfYdUxiphDP/QvvIu/3ZqsNkYRb9EP+wBt2PX4Cv3Pq4tRxHv0Q97H1eipOmYTzqMfThGrMEaVMZtxAf1Q93BYhFFVzBb8iH6YO7hchFFFTCziNnaNMCYasxU/oT/8FvaNMCYSsw0/oz80JcJYh2HMDSyCIhbRHyZfogZJJRazH7OiiC/oD/HmjPHnXMVsbMcl9INfRw3v13LFnEDb87kWcrADv6IfWH8lXRMaOozRv0ZqzDO0/fRKmMxO/IZ+0IvoL+zcMfrs4vc6iEnswu/oN53GGBo6vEjHiQkj3mHSq+Fu/IF+0ykcRWpMGKFb/z04Nvrln+g3vYBdGDcme8RaDN8nzmMf+sZkjxBH0G96Bseha0yRCPEEbdPHWkhguZhiEUKvErbxcS0kMizmbLCWNUI8RNt8VgsZiMV4s0eIQ+gP0fOnHAyLKRIh9ObzGv1hlzH1Fl2cQ79vsQhDT0M+oD/0CqbEnEa/X/EIIxZjN4p9mViEEYu5hn1iJh5hKCZ8XtU1ppoIIxajz9KjYqqLMGIxwx44VBthdImpPsKIxejT4TGccWvyD+obqqOJHsYixGJKqqeZxVDMC4wdnNuiIULXxgHU1wf6hqqUukVqNBqNFc9g8B/656ZbmAFlcwAAAABJRU5ErkJggg==" /></div>
                  </label>
                </div>
                <div className="traitUp"></div>
                <div className="interface__erasersContainer__eraseAllContainer">
                  <h4 className="interface__erasersContainer__eraseAllContainer__title">Erase all</h4>
                  <div className="interface__erasersContainer__eraseAllContainer__btn" onClick={this.cleanCells}><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAFwSURBVGhD7ZmtSgVRFIVHBDEIahMUX0AFg8EgWHwEQRCsPoAWq8Fg1SCCVYuCJvEHk8VkEGwWX8AsFl0L9oaDHPHOZZ87w2V98JXFMPssmDn3cqYSQggBpuEBvIH3Ge/gMZyFrWUSfsDvDvyE87CV7MHcov/yDLaSS+iLPIWbGQ+hX/MMe8oAHO/AW+iL3Lbst2vQr3m17D8HYQij0Ic34RwMQUWCDCvi78gu9JufWxZtbkbYO+LsQB/CXakEvZihInVotMgYXDGXGCR4TocZGAvQ8wkGRqNFuHjP3xkkeE75h9J5hJ6vMzBUpA4qYqpINCpiqkg0KmKqSDQqYqpINCpitr7IIuSZL31hkOA5nWJgXEPPVxkYjRaJREXq0DdFeDDtQx4YFOAE+gye3BdhGfoQegRznw66dR9+Qb//BiwCj06fYFqmlG8wPT4Kh1sot9jc8Cj5WzQDizME+ShcwNwHz269gltwBAohRF9SVT/YcCJDemJ9EwAAAABJRU5ErkJggg==" /></div>
                </div>
              </div>
            </div>
            <div className="traitS"></div>
            
            <div className="interface__pasteDrawingContainer">
              <h3>Paste drawing here</h3>
              <PasteDrawing onClick={this.newDrawing} />
            </div>
            <div className="traitS"></div>

            <div className="interface__utilsBtnsContainer">
              <div className="interface__utilsBtnsContainer__saveBtn" onClick={this.saveDrawing}>Save</div>
              <div className="interface__utilsBtnsContainer__exitBtn" onClick={this.props.onClick}>Exit</div>
            </div>
          </div>
          
        </div>
      </div>
    )
  };
}

const Menu = props => {
  return (
    <div className="menu">
      <h1 className="menu__title">Pixel Art Something.</h1>
      <div className="menu__boardsContainer">
        <div className="menu__boardsContainer__board" onClick={props.onClick} data-num="1">Board 1</div>
        <div className="menu__boardsContainer__board" onClick={props.onClick} data-num="2">Board 2</div>
        <div className="menu__boardsContainer__board" onClick={props.onClick} data-num="3">Board 3</div>
      </div>
    </div>
  )
}

class App extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      appState: 0,
    };
  }
  
  selectBoard = e => {
    this.setState({
      appState: parseInt(e.target.getAttribute('data-num')),
    });
  }
  
  backToMenu = e => {
    this.setState({
      appState: 0,
    });
  }
  
  render() {
    const whatToRender = !this.state.appState ? <Menu onClick={this.selectBoard} /> : <Drawing num={this.state.appState} onClick={this.backToMenu}/>;
    
    return (
      whatToRender
    )
  }
}

// ReactDOM.render(<App />, document.getElementById('root'));

export default App;