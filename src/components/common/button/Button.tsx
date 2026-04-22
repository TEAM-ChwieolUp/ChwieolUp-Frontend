import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import styles from './button.module.scss';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

function getClassName(...classNames: Array<string | false | null | undefined>) {
  return classNames.filter(Boolean).join(' ');
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      leftIcon,
      rightIcon,
      className,
      children,
      disabled,
      type = 'button',
      ...props
    },
    ref,
  ) => {
    const hasOnlyIcon = children === undefined || children === null;

    return (
      <button
        {...props}
        ref={ref}
        type={type}
        disabled={disabled}
        className={getClassName(
          styles.button,
          styles[variant],
          styles[size],
          fullWidth && styles.fullWidth,
          hasOnlyIcon && styles.iconOnly,
          className,
        )}
      >
        {leftIcon ? (
          <span className={styles.icon} aria-hidden='true'>
            {leftIcon}
          </span>
        ) : null}
        {children ? <span className={styles.label}>{children}</span> : null}
        {rightIcon ? (
          <span className={styles.icon} aria-hidden='true'>
            {rightIcon}
          </span>
        ) : null}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;
