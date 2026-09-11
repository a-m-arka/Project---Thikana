import { Link, Navigate } from 'react-router-dom';
import { HiArrowRight, HiCheckCircle, HiOutlineBuildingOffice2 } from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';
import './landing.scss';
import logo from '../../assets/Thikana_logo_1.png';

export default function Landing() {
  const { token } = useAuth();
  if (token) return <Navigate to="/app/home" replace />;
  return (
    <div className="landing">
      <header>
        <Link className="landing__brand" to="/">
          <img src={logo} alt="Thikana Logo" />
        </Link>
        <div>
          <Link to="/login">Log in</Link>
          <Link className="button button--small" to="/signup">
            Create account
          </Link>
        </div>
      </header>
      <main>
        <section className="landing__hero">
          <div>
            <p className="eyebrow">A simpler way to find your place</p>
            <h1>
              Your next <em>Thikana</em> starts here.
            </h1>
            <p className="landing__lead">
              Discover places to rent, buy, or list—within a community of verified members.
            </p>
            <div className="landing__cta">
              <Link className="button" to="/signup">
                Get started <HiArrowRight />
              </Link>
              <Link className="text-link" to="/login">
                I already have an account
              </Link>
            </div>
            <div className="landing__trust">
              <span>
                <HiCheckCircle /> Verified members
              </span>
              <span>
                <HiCheckCircle /> Clear property details
              </span>
            </div>
          </div>
          <div className="landing__visual">
            <img
              src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85"
              alt="A calm modern home"
            />
            <div className="landing__floating">
              <HiOutlineBuildingOffice2 />
              <div>
                <strong>Find your fit</strong>
                <small>Rent, buy, or list</small>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
