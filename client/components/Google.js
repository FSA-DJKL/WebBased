import React, {Component} from 'react'
import {image, API_key} from './image.json'
import axios from 'axios'
// const prettier = require("prettier");
import prettier from 'prettier/standalone'
import parserBabel from 'prettier/parser-babel'
// import {Algorithmia} from 'algorithmia'

class Google extends Component {
  constructor() {
    super()
    this.state = {
      error: '',
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
    console.log(data)
    const text = data.responses[0].fullTextAnnotation.text
    console.log(typeof text, text)
    try {
      const formatted = await prettier.format(text, {
        parser: 'babel',
        plugins: [parserBabel],
      })
      console.log(formatted)
      document.getElementById('formatted').value = formatted
    } catch (er) {
      console.log(er, er.message)
      this.setState({error: er.message})
    }

    document.getElementById('text').innerHTML = text

    const language = await Algorithmia.client('simQ7+K3ZDIOxVQe86bEe0p7btl1')
      .algo(
        'PetiteProgrammer/ProgrammingLanguageIdentification/0.1.3?timeout=300'
      ) // timeout is optional
      .pipe(document.getElementById('formatted').value)
    console.log(language.result)
    const arr = `Language Prediction: ${language.result[0][0]}, ${language.result[1][0]}`
    document.getElementById('language').innerHTML = arr
  }

  render() {
    return (
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
    )
  }
}

export default Google
