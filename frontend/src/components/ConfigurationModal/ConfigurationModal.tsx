import {useRef, useState} from 'react'
import {useAppDispatch, useAppSelector} from "@/store";
import {updateConfig} from "@/slices/config";

function ConfigurationModal() {

  const openaiApiKey = useAppSelector(state => state.configuration.openaiApiKey);
  const [show, setShow] = useState(openaiApiKey === '');
  const [openaiApiKeyInputValue, setOpenaiApiKeyInputValue] = useState('');
  const dispatch = useAppDispatch();

  const handleConfirm = () => {
    dispatch(updateConfig('openaiApiKey', openaiApiKeyInputValue));
    setShow(false);
  }

  return (
    <div
      id="configuration-modal"
      className={`modal ${
        show ? 'modal-open' : ''
      }`}
    >
      <div className="modal-box">
        <h3 className="font-bold text-lg">Configuration</h3>
        <div className="mt-4 form-control w-full max-w-xs">
          <label htmlFor="Where" className="form-label label">
            <span className="label-text">OpenAI API Key</span>
          </label>
          <input
            type="text"
            className="form-input input input-bordered w-full max-w-xs"
            placeholder="sk-XXX..."
            value={openaiApiKeyInputValue}
            onChange={(event) =>
              setOpenaiApiKeyInputValue(event.target.value)
            }
          />
        </div>
        <div className="modal-action">
          <button className="btn btn-primary" onClick={handleConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfigurationModal
