import React from 'react';
import { BaseProps } from '../../types/ui';

interface StepProps extends BaseProps {
  /**
   * The title of the step
   */
  title: React.ReactNode;

  /**
   * The description of the step
   */
  description?: React.ReactNode;

  /**
   * Whether the step is optional
   */
  optional?: boolean;

  /**
   * The status of the step
   */
  status?: 'waiting' | 'processing' | 'completed' | 'error';

  /**
   * Custom icon to display
   */
  icon?: React.ReactNode;

  /**
   * Whether the step is disabled
   */
  disabled?: boolean;
}

interface StepperProps extends BaseProps {
  /**
   * The current active step (0-based)
   */
  activeStep: number;

  /**
   * The orientation of the stepper
   */
  orientation?: 'horizontal' | 'vertical';

  /**
   * The size of the stepper
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Whether to alternate the text alignment in horizontal mode
   */
  alternativeLabel?: boolean;

  /**
   * Whether to show the connector lines
   */
  connector?: boolean;

  /**
   * Whether to show progress animation
   */
  progressAnimation?: boolean;

  /**
   * Callback when a step is clicked
   */
  onChange?: (step: number) => void;
}

interface StepperComposition {
  Step: React.FC<StepProps>;
}

const Stepper: React.FC<StepperProps> & StepperComposition = ({
  children,
  activeStep,
  orientation = 'horizontal',
  size = 'md',
  alternativeLabel = false,
  connector = true,
  progressAnimation = true,
  onChange,
  className = '',
  ...props
}) => {
  const steps = React.Children.toArray(children);
  const totalSteps = steps.length;

  const sizes = {
    sm: {
      icon: 'w-6 h-6',
      text: 'text-sm',
      connector: 'h-0.5',
    },
    md: {
      icon: 'w-8 h-8',
      text: 'text-base',
      connector: 'h-0.5',
    },
    lg: {
      icon: 'w-10 h-10',
      text: 'text-lg',
      connector: 'h-1',
    },
  };

  const getStepStatus = (index: number): StepProps['status'] => {
    if (index === activeStep) return 'processing';
    if (index < activeStep) return 'completed';
    return 'waiting';
  };

  return (
    <div
      className={`
        ${orientation === 'horizontal' ? 'flex' : 'flex-col'}
        ${className}
      `}
      {...props}
    >
      {steps.map((step, index) => {
        const stepProps = (step as React.ReactElement<StepProps>).props;
        const status = stepProps.status || getStepStatus(index);
        const isLast = index === totalSteps - 1;

        return (
          <div
            key={index}
            className={`
              flex
              ${orientation === 'horizontal'
                ? `flex-1 ${alternativeLabel ? 'flex-col items-center' : ''}`
                : 'items-start'
              }
              ${isLast ? '' : 'relative'}
            `}
          >
            {/* Step content */}
            <div
              className={`
                flex
                ${orientation === 'horizontal' && !alternativeLabel ? 'flex-col' : 'items-center'}
                ${stepProps.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              onClick={() => !stepProps.disabled && onChange?.(index)}
            >
              {/* Icon/number */}
              <div
                className={`
                  flex items-center justify-center
                  rounded-full
                  ${sizes[size].icon}
                  ${status === 'completed'
                    ? 'bg-primary-600 text-white'
                    : status === 'processing'
                    ? 'bg-primary-100 text-primary-600 border-2 border-primary-600'
                    : status === 'error'
                    ? 'bg-red-100 text-red-600 border-2 border-red-600'
                    : 'bg-gray-100 text-gray-500 border-2 border-gray-300'
                  }
                  transition-colors
                `}
              >
                {stepProps.icon || (
                  status === 'completed' ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )
                )}
              </div>

              {/* Title and description */}
              <div
                className={`
                  ${orientation === 'horizontal' && !alternativeLabel ? 'mt-2' : 'ml-3'}
                  ${alternativeLabel ? 'text-center mt-2' : ''}
                `}
              >
                <div className={`font-medium ${sizes[size].text}`}>
                  {stepProps.title}
                </div>
                {stepProps.description && (
                  <div className="text-sm text-gray-500">
                    {stepProps.description}
                  </div>
                )}
                {stepProps.optional && (
                  <div className="text-sm text-gray-500">
                    Optional
                  </div>
                )}
              </div>
            </div>

            {/* Connector */}
            {!isLast && connector && (
              <div
                className={`
                  ${orientation === 'horizontal'
                    ? `
                      absolute top-4 left-0 right-0 -mx-4
                      ${sizes[size].connector}
                      ${alternativeLabel ? 'top-3' : ''}
                    `
                    : `
                      absolute top-0 bottom-0 left-4
                      w-0.5 -my-4
                      ${alternativeLabel ? 'left-1/2' : ''}
                    `
                  }
                  bg-gray-200
                `}
              >
                {progressAnimation && index < activeStep && (
                  <div
                    className={`
                      absolute inset-0
                      bg-primary-600
                      transition-all duration-500
                      ${orientation === 'horizontal' ? 'w-full' : 'h-full'}
                    `}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const Step: React.FC<StepProps> = () => {
  return null; // Rendered by Stepper
};

Stepper.Step = Step;

export default Stepper;

/**
 * Stepper Component Usage Guide:
 * 
 * 1. Basic stepper:
 *    <Stepper activeStep={1}>
 *      <Stepper.Step title="Step 1" />
 *      <Stepper.Step title="Step 2" />
 *      <Stepper.Step title="Step 3" />
 *    </Stepper>
 * 
 * 2. With descriptions:
 *    <Stepper activeStep={1}>
 *      <Stepper.Step
 *        title="Step 1"
 *        description="This is step 1"
 *      />
 *      <Stepper.Step
 *        title="Step 2"
 *        description="This is step 2"
 *      />
 *    </Stepper>
 * 
 * 3. Vertical orientation:
 *    <Stepper
 *      activeStep={1}
 *      orientation="vertical"
 *    >
 *      <Stepper.Step title="Step 1" />
 *      <Stepper.Step title="Step 2" />
 *    </Stepper>
 * 
 * 4. Different sizes:
 *    <Stepper size="sm" />
 *    <Stepper size="md" />
 *    <Stepper size="lg" />
 * 
 * 5. Alternative label:
 *    <Stepper alternativeLabel>
 *      <Stepper.Step title="Step 1" />
 *      <Stepper.Step title="Step 2" />
 *    </Stepper>
 * 
 * 6. Without connector:
 *    <Stepper connector={false}>
 *      <Stepper.Step title="Step 1" />
 *      <Stepper.Step title="Step 2" />
 *    </Stepper>
 * 
 * 7. Optional steps:
 *    <Stepper>
 *      <Stepper.Step title="Step 1" />
 *      <Stepper.Step
 *        title="Step 2"
 *        optional
 *      />
 *    </Stepper>
 * 
 * 8. Custom icons:
 *    <Stepper>
 *      <Stepper.Step
 *        title="Step 1"
 *        icon={<CustomIcon />}
 *      />
 *    </Stepper>
 * 
 * 9. With error:
 *    <Stepper>
 *      <Stepper.Step
 *        title="Step 1"
 *        status="error"
 *      />
 *    </Stepper>
 * 
 * 10. Interactive:
 *     <Stepper
 *       activeStep={activeStep}
 *       onChange={(step) => setActiveStep(step)}
 *     >
 *       <Stepper.Step title="Step 1" />
 *       <Stepper.Step title="Step 2" />
 *     </Stepper>
 * 
 * Notes:
 * - Multiple orientations
 * - Different sizes
 * - Alternative label layout
 * - Optional steps
 * - Custom icons
 * - Progress animation
 * - Error states
 * - Interactive navigation
 * - Accessible
 */
