const fs = require('fs');

const path = 'src/pages/UserDashboardPage.tsx';
let c = fs.readFileSync(path, 'utf8');

const targetStr = `              {(
                details?.status === "confirmed" || details?.status === "pending" || booking.status === "confirmed" || booking.status === "pending"
              ) && (
                  <div className="glass-card rounded-2xl p-4 space-y-3 border-gold/20">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-gold" />
                      <h4 className="text-sm font-semibold text-foreground">{t("app.userDashboard.rescheduleBooking", "Reschedule Booking")}</h4>
                    </div>

                      }}
                    >
                      <CalendarDays className="h-4 w-4" /> {t("app.userDashboard.reschedule", "Reschedule")}
                    </button>

                  </div>
                )}`;

const replaceStr = `              {(
                details?.status === "confirmed" || details?.status === "pending" || booking.status === "confirmed" || booking.status === "pending"
              ) && (
                  <div className="glass-card rounded-2xl p-4 space-y-3 border-gold/20">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-gold" />
                      <h4 className="text-sm font-semibold text-foreground">{t("app.userDashboard.rescheduleBooking", "Reschedule Booking")}</h4>
                    </div>

                    {(details?.rescheduleCount >= 1 || booking.rescheduleCount >= 1) ? (
                      <div className="text-xs text-amber-400/90 bg-amber-400/10 border border-amber-400/20 p-3 rounded-xl">
                        {t("app.userDashboard.alreadyRescheduled", "You have already rescheduled this booking once. Further rescheduling is not permitted.")}
                      </div>
                    ) : (
                      <>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {t("app.userDashboard.rescheduleHint", "Change only the date and time slot. Payment remains the same.")}
                        </p>

                        <button
                          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gold/30 bg-gold/8 text-gold text-sm hover:bg-gold/15 transition-colors w-full justify-center"
                          onClick={() => {
                            navigate("/user/reschedule/" + rawId, {
                              state: { booking: details || booking }
                            });
                          }}
                        >
                          <CalendarDays className="h-4 w-4" /> {t("app.userDashboard.reschedule", "Reschedule")}
                        </button>
                      </>
                    )}

                  </div>
                )}`;

c = c.replace(targetStr, replaceStr);
fs.writeFileSync(path, c);
