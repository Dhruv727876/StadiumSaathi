import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MapView } from '../components/MapView';
import { CrowdDashboard } from '../components/CrowdDashboard';
import { AccessibilitySetup } from '../components/AccessibilitySetup';
import { Wayfinding } from '../components/Wayfinding';
import { Transportation } from '../components/Transportation';

describe('StadiumSaathi Component Render & Interaction Tests', () => {
  
  // 1. MapView Tests
  describe('MapView', () => {
    it('renders the interactive fallback map successfully', () => {
      render(<MapView selectedZone="North Gate" onSelectZone={jest.fn()} />);
      expect(screen.getByText(/StadiumSaathi Navigation Map/i)).toBeInTheDocument();
      expect(screen.getByText(/North Gate/i)).toBeInTheDocument();
    });

    it('triggers zone selection when fallback buttons are clicked', () => {
      const selectZoneSpy = jest.fn();
      render(<MapView selectedZone="North Gate" onSelectZone={selectZoneSpy} />);
      
      const eastButton = screen.getByText('East Stand');
      fireEvent.click(eastButton);
      expect(selectZoneSpy).toHaveBeenCalledWith('East Stand');
    });
  });

  // 2. CrowdDashboard Tests
  describe('CrowdDashboard', () => {
    it('renders crowd dashboard headers and items', () => {
      render(<CrowdDashboard selectedZone="North Gate" onSelectZone={jest.fn()} />);
      expect(screen.getByText(/Live Crowd Congestion/i)).toBeInTheDocument();
    });
  });

  // 3. AccessibilitySetup Tests
  describe('AccessibilitySetup', () => {
    it('renders and reflects accessibility preferences', () => {
      render(
        <AccessibilitySetup
          wheelchair={true}
          sensoryFriendly={false}
          stepFree={false}
          onChange={jest.fn()}
        />
      );
      expect(screen.getByText(/Accessibility Profile Setup/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Toggle Wheelchair Routing/i)).toBeInTheDocument();
    });
  });

  // 4. Wayfinding Tests
  describe('Wayfinding', () => {
    it('renders wayfinding form drop-downs and buttons', () => {
      render(<Wayfinding languageCode="en" apiUrl="http://localhost:5000" />);
      expect(screen.getByText(/Smart Wayfinding/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Calculate Route/i })).toBeInTheDocument();
    });
  });

  // 5. Transportation Tests
  describe('Transportation', () => {
    it('renders transport options and inputs', () => {
      render(<Transportation languageCode="en" apiUrl="http://localhost:5000" />);
      expect(screen.getByText(/Transportation & Parking/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Get AI Recommendation/i })).toBeInTheDocument();
    });
  });
});
