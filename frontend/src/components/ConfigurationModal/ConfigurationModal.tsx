import {useState} from 'react'
import {useAppDispatch, useAppSelector} from "@/store";
import {ImageGeneratorApis, updateConfig} from "@/slices/config";

function ConfigurationModal() {

  const imageGenApi = useAppSelector(state => state.configuration.imageGeneratorApi);
  const imageGenApiKey = useAppSelector(state => state.configuration.imageGeneratorApiKey);
  const [show, setShow] = useState(imageGenApiKey === '');
  const [imageGenApiKeyInputValue, setImageGenApiKeyInputValue] = useState('');
  const [selectedAPI, setSelectedAPI] = useState(imageGenApi); // Default API is OpenAI
  const dispatch = useAppDispatch();

  const handleConfirm = () => {
    dispatch(updateConfig({key: 'imageGeneratorApi', value: selectedAPI}));
    dispatch(updateConfig({key: 'imageGeneratorApiKey', value: imageGenApiKeyInputValue}));
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
          <label htmlFor="api-selection" className="form-label label">
            <span className="label-text">API Selection</span>
          </label>
          <select
            value={selectedAPI}
            onChange={e => setSelectedAPI(e.target.value as ImageGeneratorApis)}
            className="form-input input input-bordered w-full max-w-xs"
          >
            {Object.values(ImageGeneratorApis).map(api =>
              <option key={api} value={api}>{api}</option>
            )}
          </select>
        </div>
        <div className="mt-4 form-control w-full max-w-xs">
          <label htmlFor="api-key" className="form-label label">
            <span className="label-text">OpenAI API Key</span>
          </label>
          <input
            type="text"
            className="form-input input input-bordered w-full max-w-xs"
            placeholder="sk-XXX..."
            name={"api-key"}
            value={imageGenApiKeyInputValue}
            onChange={(event) =>
              setImageGenApiKeyInputValue(event.target.value)
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
