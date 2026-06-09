import { useCallback, useState } from 'react';
import { useDropzone, type FileWithPath } from 'react-dropzone';
import { Button } from '../ui/button';

type FileUploaderProps = {
  fieldChange: (FILES: File[]) => void;
  imageUrl?: string;
};

const FileUploader = ({ fieldChange, imageUrl }: FileUploaderProps) => {
  const [file, setFile] = useState<File[]>([]);
  const [fileUrl, setFileUrl] = useState<string>(imageUrl || '');

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      setFileUrl(URL.createObjectURL(acceptedFiles[0]));
      setFile(acceptedFiles);
      fieldChange(acceptedFiles);
    },
    [fieldChange],
  );
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.svg'] },
  });

  console.log('file', file);

  return (
    <div
      className='flex flex-center flex-col bg-dark-3 rounded-xl cursor-pointer'
      {...getRootProps()}
    >
      <input className=' cursor-pointer' {...getInputProps()} />
      {fileUrl ? (
        <>
          <div className='flex flex-1 justify-center w-full p-5 lg:p-10 '>
            <img src={fileUrl} alt='image' className=' file_uploader-img' />
          </div>
          <p className='file_uploader-label mb-6'>
            Click or drag to replace image
          </p>
        </>
      ) : (
        <div className='file_uploader-box'>
          <img
            src='/assets/icons/file-upload.svg'
            alt='file-upload'
            height={96}
            width={77}
          />
          <h3 className='text-light-2 base-medium mb-2 mt-6'>
            Drag and drop your photo here
          </h3>
          <p className='text-light-4 small-regular mb-6'>PNG, JPG, SVG</p>
          <Button className='shad-button_dark_4'>Select from device</Button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
