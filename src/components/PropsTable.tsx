import { reduce } from "lodash"
import { computed, defineComponent, PropType, VNode } from "vue"
import { TextComponentProps } from "@/defaultProps"
import { mapPropsToForms } from "@/propsMap"
import {Input, InputNumber, Slider, Radio, Select} from 'ant-design-vue'

const mapToComponent = {
  'a-input': Input,
  'a-input-number': InputNumber,
  'a-slider': Slider,
  'a-radio-group': Radio.Group,
  'a-radio-button': Radio.Button,
  'a-select': Select,
  'a-select-option': Select.Option,
} as any

function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

interface FormProps {
  component: string;
  subComponent?: string;
  value: string;
  extraProps?: { [key: string]: any };
  text?: string;
  options?: { text: string | VNode; value: any }[];
  valueProp?: string;
  eventName: string;
  events: { [key: string]: (e: any) => void };
}

export default defineComponent({
  name: "props-table",
  props: {
    props: {
      type: Object as PropType<TextComponentProps>,
      required: true,
    },
  },
  emits: ["change"],
  setup(props, context) {
    const finalProps = computed(() => {
      return reduce(
        props.props,
        (result, value, key) => {
          const newKey = key as keyof TextComponentProps
          const item = mapPropsToForms[newKey]
          if (item) {
            const {
              valueProp = "value",
              eventName = "change",
              initalTransform,
              afterTransform,
            } = item
            const newItem: FormProps = {
              ...item,
              value: initalTransform ? initalTransform(value) : value,
              valueProp,
              eventName,
              events: {
                ['on' + capitalizeFirstLetter(eventName)]: (e: any) => {
                  context.emit("change", {
                    key,
                    value: afterTransform ? afterTransform(e) : e,
                  })
                },
              },
            }
            result[newKey] = newItem
          }
          return result
        },
        {} as { [key: string]: FormProps }
      )
    })
    return () => 
      <div class="props-table">
        {
          Object.keys(finalProps.value).map(key => {
            const value = finalProps.value[key]
            const componentName = mapToComponent[value.component]
            const subComponent = value.subComponent ? mapToComponent[value.subComponent] : ''
            const props = {
              [value.valueProp as string]: value.value,
              ...value.extraProps,
              ...value.events
            }
            return (
              <div class="prop-item" key={key}>
                {value.text && <span class="label">{value.text}</span>}
                <div class="prop-component">
                  <componentName {...props}>
                    {value.options && value.options.map((option, k) => {
                      return (
                        <subComponent value={option.value} key={k}>{option.text}</subComponent>
                      )
                    })}
                  </componentName>
                </div>
              </div>
            )
          })
        }
      </div>
  }
})