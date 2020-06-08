import React, {useCallback, useState  } from 'react'
import {useDropzone} from 'react-dropzone'

import './style.css'
interface Props{
  onFileUploaded: (file:File) => void;
}

const Dropzone : React.FC<Props> = ({onFileUploaded}) => {
  const [selectedFile, setSelectedFile] = useState('');
  const onDrop = useCallback(acceptedFiles => {
    const file = acceptedFiles[0];
    const fileUrl = URL.createObjectURL(file);
    setSelectedFile(fileUrl);
    onFileUploaded(file);
  }, [onFileUploaded])
  const {getRootProps, getInputProps, isDragActive} = useDropzone({
    onDrop,
    accept: 'image/*'
  })

  return (
    <div className='dropzone' {...getRootProps()}>
      <input {...getInputProps()} accept='image/*' />
      
        {selectedFile ? 
          <img src={selectedFile} />
          :
          <p>Imagem do estabelicimento</p>
        }    
    </div>
  )
}
export default Dropzone;