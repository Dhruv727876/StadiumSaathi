import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MapView } from '../components/MapView';
import { CrowdDashboard } from '../components/CrowdDashboard';
import { AccessibilitySetup } from '../components/AccessibilitySetup';
import { Wayfinding } from '../components/Wayfinding';
import { Transportation } from '../components/Transportation';
import { vi } from 'vitest';

describe('StadiumSaathi Component Render & Interaction Tests', () => {
  
  // 1. MapView Tests
  describe('MapView', () => {
    it('renders the interactive fallback map successfully', () => {
      render(<MapView selectedZone="North Gate" onSelectZone={vi.fn()} />);
      expect(screen.getByText(/StadiumSaathi Navigation Map/i)).toBeInTheDocument();
      expect(screen.getByText(/North Gate/i)).toBeInTheDocument();
    });

    it('triggers zone selection when fallback buttons are clicked', () => {
      const selectZoneSpy = vi.fn();
      render(<MapView selectedZone="North Gate" onSelectZone={selectZoneSpy} />);
      
      const eastButton = screen.getByText('East Stand');
      fireEvent.click(eastButton);
      expect(selectZoneSpy).toHaveBeenCalledWith('East Stand');
    });

    it('asserts radiogroup role, checked states, and arrow key focus navigation', () => {
      const selectZoneSpy = vi.fn();
      render(<MapView selectedZone="North Gate" onSelectZone={selectZoneSpy} />);
      
      expect(screen.getByRole('radiogroup', { name: /Select stadium zone to examine details/i })).toBeInTheDocument();

      const northRadio = screen.getByRole('radio', { name: /North Gate/i });
      const southRadio = screen.getByRole('radio', { name: /South Gate/i });

      expect(northRadio).toHaveAttribute('aria-checked', 'true');
      expect(southRadio).toHaveAttribute('aria-checked', 'false');

      fireEvent.keyDown(northRadio, { key: 'ArrowDown', code: 'ArrowDown' });
      expect(selectZoneSpy).toHaveBeenCalledWith('South Gate');
    });
  });

  // 2. CrowdDashboard Tests
  describe('CrowdDashboard', () => {
    it('renders crowd dashboard headers and items', () => {
      render(<CrowdDashboard selectedZone="North Gate" onSelectZone={vi.fn()} />);
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
          onChange={vi.fn()}
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

    it('asserts that selecting a wheelchair-accessible profile changes the route hints in the request payload', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch').mockImplementation(() =>
        Promise.resolve({
          json: () => Promise.resolve({ success: true, response: 'STADIUM_GUIDANCE: Accessible path' }),
        } as Response)
      );

      const { rerender } = render(
        <Wayfinding
          languageCode="en"
          apiUrl="http://localhost:5000"
          accessibilityProfile="wheelchair access"
        />
      );

      const routeButton = screen.getByRole('button', { name: /Calculate Route/i });
      fireEvent.click(routeButton);

      // Wait for the button to reset from loading
      const activeBtn = await screen.findByRole('button', { name: /Calculate Route/i });

      expect(fetchSpy).toHaveBeenCalled();
      const firstCallArgs = fetchSpy.mock.calls[0];
      const payloadWithWheelchair = JSON.parse(firstCallArgs?.[1]?.body as string);
      
      expect(payloadWithWheelchair.message).toContain('Elevator A');

      fetchSpy.mockClear();
      rerender(
        <Wayfinding
          languageCode="en"
          apiUrl="http://localhost:5000"
          accessibilityProfile="none"
        />
      );

      fireEvent.click(activeBtn);
      
      // Wait for loading to finish again
      await screen.findByRole('button', { name: /Calculate Route/i });

      const secondCallArgs = fetchSpy.mock.calls[0];
      const payloadStandard = JSON.parse(secondCallArgs?.[1]?.body as string);
      
      expect(payloadStandard.message).toContain('West Concourse');
      expect(payloadStandard.message).not.toContain('Elevator A');

      fetchSpy.mockRestore();
    });
  });

  // 5. Transportation Tests
  describe('Transportation', () => {
    it('renders transport options and inputs', () => {
      render(<Transportation languageCode="en" apiUrl="http://localhost:5000" />);
      expect(screen.getByText(/Transportation & Parking/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Get AI Recommendation/i })).toBeInTheDocument();
    });

    it('asserts that kickoffMinutes < 15 results in correct preferredOption and urgency in prompt payload', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch').mockImplementation(() =>
        Promise.resolve({
          json: () => Promise.resolve({ success: true, response: 'STADIUM_GUIDANCE: Fast transit' }),
        } as Response)
      );

      render(<Transportation languageCode="en" apiUrl="http://localhost:5000" />);

      const minutesInput = screen.getByLabelText(/Minutes to Kickoff/i);
      fireEvent.change(minutesInput, { target: { value: '10' } });

      const getRecButton = screen.getByRole('button', { name: /Get AI Recommendation/i });
      fireEvent.click(getRecButton);

      // Wait for the button to reset from loading
      await screen.findByRole('button', { name: /Get AI Recommendation/i });

      expect(fetchSpy).toHaveBeenCalled();
      const callArgs = fetchSpy.mock.calls[0];
      const payload = JSON.parse(callArgs?.[1]?.body as string);

      expect(payload.message).toContain('Central Metro Hub');
      expect(payload.message).toContain('urgency flag set to true');

      fetchSpy.mockRestore();
    });
  });
});
