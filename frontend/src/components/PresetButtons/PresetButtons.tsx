import React, {
  forwardRef, useImperativeHandle, useRef,
  useState
} from 'react'

export interface RefWithMethods {
  current: {
    getValue: () => string;
    setValue: (newValue: string) => void;
  }
}

type PresetButtonsProps = {
  presets: string[];
  inputRef: RefWithMethods;
}

export const InputWithRef = forwardRef(function InputWithRef(props: any, ref) {
  const inputRef = useRef(null);

  useImperativeHandle(ref, () => {
    return {
      getValue: (): string => {
        return (inputRef.current as any).value;
      },
      setValue: (newValue: string): void => {
        (inputRef.current as any).value = newValue;
        props.onChange(newValue);
      }
    };
  }, [props]);

  return <input {...props} ref={inputRef} />;
});

function PresetButtons(props: PresetButtonsProps) {

  const { presets, inputRef } = props;

  const [activeButtons, setActiveButtons] = useState<boolean[]>(new Array(presets.length).fill(false));

  const handleClicked = (index: number): void => {
    const isActive = activeButtons[index];
    const preset = presets[index];
    if (!isActive) {
      // Add to input box (at start)
      inputRef.current.setValue(`${preset}, ${inputRef.current?.getValue()}`);
      const newActiveButtons = [...activeButtons];
      newActiveButtons[index] = true;
      setActiveButtons(newActiveButtons);
    } else {
      // Remove from input box
      inputRef.current.setValue(inputRef.current.getValue().replace(preset, '').replace(', ,', ','));
      const newActiveButtons = [...activeButtons];
      newActiveButtons[index] = false;
      setActiveButtons(newActiveButtons);
    }
    if (inputRef.current.getValue().endsWith(', ')) {
      inputRef.current.setValue(inputRef.current.getValue().substring(0, inputRef.current.getValue().length - 2));
    }
    if (inputRef.current.getValue().startsWith(', ')) {
      inputRef.current.setValue(inputRef.current.getValue().substring(2, inputRef.current.getValue().length));
    }
  }

  return (
    <div>
      {presets.map((val, index) => (
        <button key={index} className={`btn btn-xs mr-2 mb-2 btn-outline ${activeButtons[index] ? 'btn-primary btn-active' : undefined}`} onClick={() => handleClicked(index)}>{val}</button>
      ))}
    </div>
  )
}

export default PresetButtons
