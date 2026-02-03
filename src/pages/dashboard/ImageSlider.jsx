

import React, { useEffect,useState } from 'react';
import { Carousel } from 'react-responsive-carousel';
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Button, Row, Col } from 'reactstrap';
import { environmentaldatas } from '../../constant/defaultValues';

const { image_url } = environmentaldatas;

const ImageSlider = ({ setSliders, sliders }) => {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Ensure the sliders state is properly initialized
    if (sliders && sliders.length > 0 && !initialized) {
      setInitialized(true);
    }
  }, [sliders, initialized]);

  const normalizeLink = (link) => {
    if (!link) return '';
    if (!link.startsWith('http://') && !link.startsWith('https://')) {
      return `http://${link}`;
    }

    return link;
  };

  const renderSlides = () => {
    return sliders?.map((item, index) => (
      
      <div key={item.notification_id || index}>
        {/* {console.log(sliders)} */}
        {/* {index >= 0 && ( */}
          <div className="slide-content" style={{ backgroundColor: item?.bg_color ?? 'transparent' }}>

            {/* <Row> */}
            {/* <Col md={6} className='d-flex'> */}
            <div className='row' >
              <div className='col-sm-8 col-md-7 col-lg-6 d-flex align-items-center'>

                <div className="floatLeft">
                  <div>
                    <h2 className="float-left f-w-600 mb-3" style={{ fontSize: '40.22px', color: item?.text_color ?? 'white' }}>{item?.heading}</h2>
                  </div>
                  <div  className='mb-2 sub-heading-cont'>
                    <p className="float-left mb-3" style={{ fontSize: '0.875rem', color: item?.text_color ?? 'white', opacity: '0.8' }}>
                      {item?.sub_heading}
                    </p>
                  </div>
                  <div >
                    <a href={normalizeLink(item?.link)} target="_blank" >
                      <Button className="float-left btn btn-custom" htmlType='button' style={{ backgroundColor: item?.bg_color ?? 'transparent', color: item?.text_color ?? 'white', border: `1px solid ${item?.text_color ?? 'white'}` }}>
                        {item?.button_text}
                      </Button>
                    </a>

                  </div>
                </div>
              </div>
              {/* </Col> */}
              {/* <Col md={6}> */}
              <div className='col-sm-4 col-md-5 col-lg-6'>
                <div className='image-cont'>
                  <img src={image_url + (item.banner_image)} alt={`Slide ${index}`} className="imageStyle-corosel" />

                </div>
              </div>
              {/* </Col> */}
            </div>
            {/* </Row> */}

          </div>
        {/* )} */}
      </div >
    ));
  };

  if (!initialized) {
    return null; 
  }

  return (
    <div className="image-slider-container" >
      <Carousel
        showThumbs={false}
        showStatus={false}
        swipeable={false}
        infiniteLoop
        renderArrowPrev={(onClickHandler, hasPrev) =>
          hasPrev && (
            <div className="left" onClick={onClickHandler}>
              <IoIosArrowBack onClick={onClickHandler} />
            </div>
          )
        }
        renderArrowNext={(onClickHandler, hasNext) =>
          hasNext && (
            <div className="right" onClick={onClickHandler}>
              <IoIosArrowForward onClick={onClickHandler} />
            </div>
          )
        }
      >
        {renderSlides()}
      </Carousel>
    </div>
  );
};

export default ImageSlider;
