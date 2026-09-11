import './loader.scss';
const Loader = ({ width = '100%', height = '200px', text = 'Loading' }) => {
  return (
    <div className="thikana-loader" style={{ width, height }}>
      {' '}
      <div className="thikana-loader__content">
        {' '}
        <div className="thikana-loader__house">
          {' '}
          <div className="house__roof" />{' '}
          <div className="house__body">
            {' '}
            <div className="house__door" /> <div className="house__window house__window--left" />{' '}
            <div className="house__window house__window--right" />{' '}
          </div>{' '}
          <div className="house__chimney" />{' '}
        </div>{' '}
        <div className="thikana-loader__line" />{' '}
        <div className="thikana-loader__text">
          {' '}
          {text}{' '}
          <span className="thikana-loader__dots">
            {' '}
            <span>.</span> <span>.</span> <span>.</span>{' '}
          </span>{' '}
        </div>{' '}
      </div>{' '}
    </div>
  );
};
export default Loader;
