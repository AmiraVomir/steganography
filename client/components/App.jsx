import React, { Component } from 'react';
import axios from 'axios';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      text: '',
      confirmation: null,
      selectedImg: null,
      imgPreview: null,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleText = this.handleText.bind(this);
    this.handleImage = this.handleImage.bind(this);
    this.handleEncode = this.handleEncode.bind(this);
    this.handleDecode = this.handleDecode.bind(this);
  }

  handleChange(e) {
    e.target.id === 'selectedImg' ? this.setState({ selectedImg: e.target.files[0], imgPreview: URL.createObjectURL(e.target.files[0]) })
      : this.setState({ [e.target.id]: e.target.value });
  }

  handleText() {
    const { text } = this.state;
    return axios.post('/uploadText', { text });
  }

  handleImage() {
    const { selectedImg } = this.state;
    const fd = new FormData();
    fd.append('newImage', selectedImg, selectedImg.name);
    return axios.post('/uploadImg', fd, { onUploadProgress: (progressEvent) => console.log(`Upload Process: ${Math.round((progressEvent.loaded / progressEvent.total) * 100)} %`) });
  }

  handleEncode(e) {
    e.preventDefault();
    const { selectedImg, text } = this.state;
    if (selectedImg !== null && text !== '') {
      axios.all([this.handleImage(), this.handleText()])
        .then(axios.spread((...response) => {
          this.setState({
            confirmation: 'keep it secret, keep it safe',
          });
          setTimeout(() => {
            this.setState({
              text: '',
              selectedImg: null,
              confirmation: 'mischief managed!',
              imgPreview: null,
            });
          }, 4000);
          setTimeout(() => window.location.reload(false), 5000);
        }))
        .then(() => window.open('/download'))
        .catch((err) => console.log(`Something went wrong! ${err}`));
    }
  }

  handleDecode() {
    const { selectedImg } = this.state;
    const fd = new FormData();
    fd.append('decodeImage', selectedImg, selectedImg.name);
    axios.post('/decode', fd, { onUploadProgress: (progressEvent) => console.log(`Upload Process: ${Math.round((progressEvent.loaded / progressEvent.total) * 100)} %`) })
      .then((res) => { this.setState({ decoded: res.data, imgPreview: null }); })
      .catch((err) => console.log(`Something went wrong! ${err}`));
  }

  render() {
    const {
      text, confirmation, imgPreview, selectedImg, decoded,
    } = this.state;
    return (
      <div className="main-container">
        <h1>
          Stegarize
        </h1>
        <div className="confirmation">
          {confirmation !== null && (
          <div>{confirmation}</div>)}
        </div>
        <br />
        <form
          className="userArea"
          onSubmit={this.handleEncode}
          encType="multipart/form-data"
          autoComplete="off"
        >
          <input
            type="file"
            style={{ display: 'none' }}
            id="selectedImg"
            onChange={this.handleChange}
            ref={(fileInput) => this.fileInput = fileInput}
          />
          <button className="uploadButton" type="button" onClick={() => this.fileInput.click()}>Upload</button>
          <input
            className="textBox"
            type="text"
            placeholder="Hide your message"
            id="text"
            value={text}
            onChange={this.handleChange}
          />
          <button className="encodeButton" type="submit">Encode</button>
          {selectedImg !== null
          && <button className="decodeButton" type="button" onClick={this.handleDecode}>Decode</button>}
        </form>
        <br />
        {imgPreview !== null && (
        <div>
          <img alt="loading..." src={imgPreview} />
        </div>
        )}
        <br />
        {decoded
        && (
        <div>
          Hidden Message:
          {' '}
          {decoded}
        </div>
        )}
      </div>
    );
  }
}

export default App;
