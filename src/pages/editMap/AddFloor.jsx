import React, { useRef, useState } from 'react'
import FloorPlanDtlsBar from './components/FloorPlanDtlsBar'
import ReactCrop, {
  centerCrop,
  makeAspectCrop, 
} from 'react-image-crop'
import { canvasPreview } from './components/CanvasPreview'
import 'react-image-crop/dist/ReactCrop.css'
import { useDebounceEffect } from './hooks/useDebounceEffect'
import { useNavigate } from 'react-router-dom'
import PrimaryBtn from '../../components/buttons/PrimaryBtn'


function centerAspectCrop(
  mediaWidth,
  mediaHeight,
  aspect,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}
const AddFloor = () => {

  const navigate = useNavigate()
  const previewCanvasRef = useRef(null)
  const imgRef = useRef(null)
  const blobUrlRef = useRef('')

  const [imgSrc, setImgSrc] = useState('')

  const [crop, setCrop] = useState()
  const [completedCrop, setCompletedCrop] = useState()
  const [scale, setScale] = useState(1)
  const [rotate, setRotate] = useState(0)
  const [aspect, setAspect] = useState(16 / 9)

  function onImageLoad(e) {
    if (aspect) {
      const { width, height } = e.currentTarget
      setCrop(centerAspectCrop(width, height, aspect))
    }
  }

  function onSubmit() {
    if (!previewCanvasRef.current) {
      throw new Error('Crop canvas does not exist')
    }

    previewCanvasRef.current.toBlob((blob) => {
      if (!blob) {
        throw new Error('Failed to create blob')
      }
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current)
      }
      blobUrlRef.current = URL.createObjectURL(blob)
      console.log(blobUrlRef.current, 'refff')
      let map = { name: 'level 1', floorPlan: URL.createObjectURL(blob) }
      localStorage.setItem('map',JSON.stringify(map))
      navigate('/edit-map/add-locations')
      // hiddenAnchorRef.current.href = blobUrlRef.current
      // hiddenAnchorRef.current.click()
    })
  }

  useDebounceEffect(
    async () => {
      if (
        completedCrop?.width &&
        completedCrop?.height &&
        imgRef.current &&
        previewCanvasRef.current
      ) {
        // We use canvasPreview as it's much faster than imgPreview.
        canvasPreview(
          imgRef.current,
          previewCanvasRef.current,
          completedCrop,
          scale,
          rotate,
        )
      }
    },
    100,
    [completedCrop, scale, rotate],
  )

  function handleToggleAspectClick() {
    if (aspect) {
      setAspect(undefined)
    } else if (imgRef.current) {
      const { width, height } = imgRef.current
      setAspect(16 / 9)
      setCrop(centerAspectCrop(width, height, 16 / 9))
    }
  }

  return (
    <div className='relative w-full' >
      <div className='absolute top-0 left-10 z-10 '  >
        <FloorPlanDtlsBar selectedImage={imgSrc} setSelectedImage={setImgSrc} onSubmit={onSubmit} />
      </div>
      <div className='flex w-5/6 ' >
        {!!imgSrc && (
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspect}
          >
            <img
              ref={imgRef}
              alt="Crop me"
              src={imgSrc}
              style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
              onLoad={onImageLoad}
            />
          </ReactCrop>
        )}
        {!!completedCrop && (
          <div className='w-1/6'>
            <div>
              <canvas
                ref={previewCanvasRef}
                style={{
                  border: '1px solid black',
                  objectFit: 'contain',
                  width: completedCrop.width,
                  height: completedCrop.height,
                }}
              />
            </div>

          </div>
        )}
      </div>
    </div>
  )
}

export default AddFloor