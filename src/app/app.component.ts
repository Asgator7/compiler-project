import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {

  public formCode: any = new FormGroup({
    code: new FormControl(
      { value: '', disabled: false }
    ),
    codeFile: new FormControl(
      { value: '', disabled: false }
    )
  });
  public file: any;
  public codeFromFile: any;
  public constraintWords = ['VOID', 'IF', 'THEN', 'ELSE', 'WHILE', 'INT', 'MAIN'];
  public identifiers: any = [];
  public formatedCode: any;

  constructor() { }

  ngOnInit() {
  }

  fileChanged(e: any) {
    this.file = e.target.files[0];
  }

  validateCode() {
    let fileReader = new FileReader();
    let code = this.formCode.get('code').value;
    if (this.formCode.get('codeFile').value) {
      fileReader.onload = (e) => {
        this.codeFromFile = fileReader.result;
      }
      fileReader.readAsText(this.file);
    }
    setTimeout(() => {
      if (this.codeFromFile) {
        code = this.codeFromFile;
      }
      let tokens: any = code.split(' ');
      let chars: any = [];
      tokens.forEach((element: any) => {
        chars.push(element.split(/([^A-Za-z])/g).filter((x: any) => x !== ''));
      });
      tokens = chars.reduce((acc: any, curVal: any) => acc.concat(curVal), []).filter((x: any) => x !== '\n' && x !== '\t' && x !== '\r');
      for (let i = 0; i < tokens.length; i++) {
        let element = tokens[i];
        if (element.match(/[0-9]/g)) {
          let j = i + 1;
          while (j < tokens.length && tokens[j].match(/[0-9]/g)) {
            element += tokens[j];
            j++;
          }
          tokens.splice(i, j - i, element);
        }
        if (element.match(/[\%\=\<\>\&\|]/g)) {
          let j = i + 1;
          while (j < tokens.length && tokens[j].match(/[\%\=\<\>\&\|]/g) && (tokens[j] === element || tokens[j] === '=')) {
            element += tokens[j];
            j++;
          }
          tokens.splice(i, j - i, element);
        }
        tokens[i] = this.identifyChar(element);
      }
      this.formatedCode = tokens.join(' ');
      this.formCode.reset();
    }, 1000);
  }

  identifyChar(item: any) {
    const analisedItem = item.toUpperCase();
    if (this.constraintWords.includes(analisedItem)) {
      return `<${analisedItem}>`;
    } else if (analisedItem.match(/[0-9]/g)) {
      return `<NUMBER, ${analisedItem}>`;
    } else if (analisedItem.match(/[\(\)\{\}\[\]\;\,\.]/g)) {
      return `<DELOP, ${analisedItem}>`;
    } else if (analisedItem.match(/[\%\=\<\>\&\|]/g)) {
      return `<RELOP, ${analisedItem}>`;
    } else if (analisedItem.match(/[\+\-\*\/]/g)) {
      return `<MATOP, ${analisedItem}>`;
    } else {
      if (!this.identifiers.find((x: any) => x.name === analisedItem)) {
        this.identifiers.push({ id: this.identifiers.length + 1, name: analisedItem });;
      }
      return `<${this.identifiers.find((x: any) => x.name === analisedItem).id}, ${analisedItem}>`;
    }
  }

  resetForm() {
    this.formCode.reset();
    this.formatedCode = '';
    this.identifiers = [];
  }
}
