import React, { Component } from 'react';
import hackernews from 'firebase-hackernews'
import logo from './logo.svg';
import './App.css';

class App extends Component {
  constructor() {
    super();

    this.state = {
      top: []
    };

    this.news = hackernews()
  }

  async componentDidMount() {
    const top = await this.news.stories('top', {page: 1, count: 40})
    this.setState({top: top})
  }

  render() {
    const liStyle = {
      listStyleType: 'none',
      textAlign: 'left',
      paddingBottom: '5px'
    };

    const top = this.state.top.map(t => (
      <li key={t.id} style={liStyle}>
        <a href={t.url}>{t.title}</a> - {t.by}
      </li>
    ));

    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Hacker News - Top</h2>
        </div>
        <p className="App-intro">
          <ul>
            {top}
          </ul>
        </p>
      </div>
    );
  }
}

export default App;
