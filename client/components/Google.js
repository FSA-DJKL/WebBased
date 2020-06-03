/* eslint-disable react/prefer-es6-class */
/* eslint-disable react/no-unused-state */
import React, {Component} from 'react'
import {image, API_key} from './image.json'
import axios from 'axios'
// const prettier = require("prettier");
import prettier from 'prettier/standalone'
import parserBabel from 'prettier/parser-babel'
import {Algorithmia} from 'algorithmia'
import {Controlled as CodeMirror} from 'react-codemirror2'

// require("codemirror/lib/codemirror.css");
// require('codemirror')
require('codemirror/mode/javascript/javascript')
require('codemirror/theme/dracula.css')

class Google extends Component {
  constructor() {
    super()
    this.state = {
      error: '',
      code: 'Test',
      // cursorPosition: {
      //   line: 0,
      //   ch: 0
      // }
    }
  }
  async componentDidMount() {
    //    console.log(image,API_key)
    const data = (
      await axios.post(
        `https://vision.googleapis.com/v1/images:annotate?key=${API_key}`,
        {
          requests: [
            {
              image: {
                content: image,
              },
              features: [
                {
                  type: 'TEXT_DETECTION',
                  // "maxResults":1
                },
                {
                  type: 'WEB_DETECTION',
                },
                {
                  type: 'LABEL_DETECTION',
                  // "maxResults":1
                },
                {
                  type: 'IMAGE_PROPERTIES',
                  // "maxResults":1
                },
              ],
            },
          ],
        },
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }
      )
    ).data
    // console.log(data)
    const text = data.responses[0].fullTextAnnotation.text
    // console.log(typeof text, text)
    try {
      const formatted = await prettier.format(text, {
        parser: 'babel',
        plugins: [parserBabel],
      })
      // console.log(formatted)
      document.getElementById('formatted').value = formatted
    } catch (er) {
      console.log(er, er.message)
      this.setState({error: er.message})
    }

    document.getElementById('text').innerHTML = text

    this.cm.editor.setValue(text)
    console.log(this.cm)

    const language = await Algorithmia.client('simQ7+K3ZDIOxVQe86bEe0p7btl1')
      .algo(
        'PetiteProgrammer/ProgrammingLanguageIdentification/0.1.3?timeout=300'
      ) // timeout is optional
      .pipe(document.getElementById('formatted').value)
    // console.log(language.result)
    const arr = `Language Prediction: ${language.result[0][0]}, ${language.result[1][0]}`
    document.getElementById('language').innerHTML = arr
  }

  render() {
    const onChange = (editor, data, newValue) => {
      console.log(editor, data, newValue)
      this.setState({code: newValue})
      console.log(editor.getValue())
    }
    const onClick = () => {
      this.cm.runMode()
    }
    return (
      <div>
        <div
          style={{
            height: '100%',
            minHeight: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <img
            src={`data:image/png;base64,${image}`}
            style={{width: 400, height: 100}}
          />
          <textarea
            type="text"
            style={{width: 200, height: 200}}
            id="text"
          ></textarea>
          <textarea
            type="text"
            style={{width: 200, height: 200}}
            id="formatted"
          ></textarea>
          <div id="language"></div>
          <div>{this.state.error ? <div>{this.state.error}</div> : ''}</div>
        </div>
        <button type="submit" onClick={onClick}>
          Run
        </button>
        <div style={{border: '1px black solid'}}>
          <CodeMirror
            style={{border: '1px black solid'}}
            // ref={r => (this.codemirror = r)}
            // className="code-mirror-container"
            ref={(c) => (this.cm = c)}
            value={this.state.code}
            onBeforeChange={(editor, data, newValue) =>
              onChange(editor, data, newValue)
            }
            // {..._.pick(this.props.input, ['value', 'name'])}
            options={{
              theme: 'dracula',
              lineNumbers: true,
              readOnly: false,
              mode: 'javascript',
            }}
          />
        </div>
      </div>
    )
  }
}

export default Google
