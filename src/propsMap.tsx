import { VNode } from "vue"
import { AllComponentProps } from "./defaultProps"

export interface PropToForm {
  component: string;
  subComponent?: string;
  // 给表单组件添加额外的属性
  extraProps?: { [key: string]: any };
  text?: string;
  options?: { text: string | VNode; value: any }[];
  initalTransform?: (v: any) => any;
  afterTransform?: (v: any) => any;
  valueProp?: string;
  eventName?: string;
}

export type PropsToForms = {
  [P in keyof AllComponentProps]?: PropToForm
}

const fontFamilyArr = [
  { text: "宋体", value: '"SimSun","STSong"' },
  { text: "黑体", value: '"SimHei","STHeiti"' },
  { text: "楷体", value: '"KaiTi","STKaiti"' },
  { text: "仿宋", value: '"FangSong","STFangsong"' },
]

const fontFamilyOptions = fontFamilyArr.map((font) => {
  return {
    value: font.value,
    text: <span style={{fontFamily: font.value}}>{font.text}</span> as VNode,
  }
})

export const mapPropsToForms: PropsToForms = {
  text: {
    text: "文本",
    component: "a-input",
    afterTransform: (e: any) => e.target.value,
  },
  fontSize: {
    text: "字号",
    component: "a-input-number",
    initalTransform: (v) => parseInt(v),
    afterTransform: (e: any) => (e ? parseInt(e) + "px" : ""),
  },
  lineHeight: {
    text: "行高",
    component: "a-slider",
    extraProps: {
      min: 0,
      max: 3,
      step: 0.1,
    },
    initalTransform: (v) => parseFloat(v),
    afterTransform: (e: any) => e.toString(),
  },
  textAlign: {
    text: "对齐",
    component: "a-radio-group",
    subComponent: "a-radio-button",
    options: [
      { value: "left", text: "左" },
      { value: "center", text: "中" },
      { value: "right", text: "右" },
    ],
    afterTransform: (e: any) => e.target.value,
  },
  fontFamily: {
    text: "字体",
    component: "a-select",
    subComponent: "a-select-option",
    options: [{ text: "无", value: "" }, ...fontFamilyOptions],
  },
  color: {
    text: '字体颜色',
    component: 'color-picker',
  },
  src: {
    component: 'image-processer'
  }
}
